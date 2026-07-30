const { Aplicacion, Descarte, Lote, Vacuna, Ubicacion, Stock, Paciente, SolicitudesAcceso, MovimientoLote } = require('../models');
const { Op } = require('sequelize');
const { alcanceUbicacion } = require('../modules/alcance');

// Formatea una fecha/hora a DD/MM/YYYY HH:MM para mostrar en el dashboard
function formatearFechaHora(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${h}:${m}`;
}

// Retorna el inicio (00:00:00) y fin (23:59:59) del día actual para filtros de BD
function rangosDeHoy() {
  const ahora = new Date();
  const inicio = new Date(ahora); inicio.setHours(0, 0, 0, 0);
  const fin    = new Date(ahora); fin.setHours(23, 59, 59, 999);
  return { inicio, fin };
}

// Retorna el inicio y fin del mes actual para filtros de conteo mensual
function rangosDelMes() {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const fin    = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
  return { inicio, fin };
}

// Retorna la fecha de hoy en formato YYYY-MM-DD (compatible con campos DATE de la BD)
function hoyStr() {
  return new Date().toISOString().split('T')[0];
}

// Retorna la fecha de hoy + 30 días en formato YYYY-MM-DD para alertas de vencimiento
function en30DiasStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

const includeUltimasAplic = [
  { model: Paciente,  as: 'paciente',  attributes: ['nombre', 'apellido', 'dni'] },
  { model: Ubicacion, as: 'ubicacion', attributes: ['nombre'] },
  {
    model: Lote, as: 'lote', attributes: ['num_lote'],
    include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo'] }]
  }
];

// ─── KPIs por rol ─────────────────────────────────────────────────────────────

// Función para calcular los KPIs del Administrador
async function kpisAdmin(alcance) {
  const { inicio: inicioHoy, fin: finHoy }   = rangosDeHoy();
  const { inicio: inicioMes, fin: finMes }   = rangosDelMes();

  // WHERE de ubicación para aplicaciones y descartes
  const whereUbic = alcance.global ? {} : { id_ubicacion: alcance.idUbicacion };

  // WHERE de stock: Depósito Nacional en Nivel Central, si no la ubicación actual
  let stockWhere;
  if (alcance.global) {
    const depNac = await Ubicacion.findAll({ where: { tipo: 'Deposito Nacional' }, attributes: ['id'] });
    stockWhere = { id_ubicacion: { [Op.in]: depNac.map(u => u.id) } };
  } else {
    stockWhere = { id_ubicacion: alcance.idUbicacion };
  }

  const [
    aplicacionesHoy,
    aplicacionesDelMes,
    stockNacional,
    lotesProximosVencer,
    descartesDelMes,
    totalPacientes,
    solicitudesPendientes
  ] = await Promise.all([
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] }, ...whereUbic } }),
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioMes, finMes] }, ...whereUbic } }),
    Stock.sum('cantidad', { where: stockWhere }),
    Lote.count({ where: { fecha_venc: { [Op.lte]: en30DiasStr() }, deletedAt: null } }),
    Descarte.count({ where: { fecha_descarte: { [Op.between]: [hoyStr().slice(0, 7) + '-01', en30DiasStr()] }, ...whereUbic } }),
    Paciente.count({ where: { deletedAt: null } }),
    SolicitudesAcceso.count({ where: { estado: 'Pendiente' } })
  ]);

  // Descartes del mes (uso strings para campo DATE)
  const ahora = new Date();
  const anoMes   = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const diasMes  = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const descartesDelMesReal = await Descarte.count({
    where: { fecha_descarte: { [Op.between]: [`${anoMes}-01`, `${anoMes}-${diasMes}`] }, ...whereUbic }
  });

  return {
    aplicacionesHoy:       aplicacionesHoy       || 0,
    aplicacionesDelMes:    aplicacionesDelMes     || 0,
    stockNacional:         stockNacional          || 0,
    lotesProximosVencer:   lotesProximosVencer    || 0,
    descartesDelMes:       descartesDelMesReal    || 0,
    totalPacientes:        totalPacientes         || 0,
    solicitudesPendientes: solicitudesPendientes  || 0
  };
}

// Función para calcular los KPIs del Auditor
async function kpisAuditor(alcance) {
  const { inicio: inicioHoy, fin: finHoy } = rangosDeHoy();
  const ahora = new Date();
  const anoMes  = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const whereUbic = alcance.global ? {} : { id_ubicacion: alcance.idUbicacion };

  const [aplicacionesHoy, aplicacionesDelMes, stockUbicaciones, descartesDelMes] = await Promise.all([
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] }, ...whereUbic } }),
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.gte]: new Date(ahora.getFullYear(), ahora.getMonth(), 1) }, ...whereUbic } }),
    Stock.sum('cantidad', { where: whereUbic }),
    Descarte.count({ where: { fecha_descarte: { [Op.between]: [`${anoMes}-01`, `${anoMes}-${diasMes}`] }, ...whereUbic } })
  ]);

  return {
    aplicacionesHoy:    aplicacionesHoy    || 0,
    aplicacionesDelMes: aplicacionesDelMes || 0,
    stockUbicaciones:   stockUbicaciones   || 0,
    descartesDelMes:    descartesDelMes    || 0
  };
}

// Función para calcular los KPIs del Administrativo
async function kpisAdministrativo(alcance) {
  const ahora = new Date();
  const anoMes  = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const whereStock  = alcance.global ? {} : { id_ubicacion: alcance.idUbicacion };
  const whereOrigen = alcance.global ? {} : { id_ubicacion_origen: alcance.idUbicacion };

  const [lotesRegistradosMes, stockEnDeposito, movimientosDespachados, movimientosEnTransito] = await Promise.all([
    Lote.count({
      where: {
        createdAt: { [Op.between]: [new Date(`${anoMes}-01`), new Date(`${anoMes}-${diasMes}T23:59:59`)] },
        deletedAt: null
      }
    }),
    Stock.sum('cantidad', { where: whereStock }),
    MovimientoLote.count({
      where: {
        ...whereOrigen,
        fecha_movimiento: { [Op.between]: [`${anoMes}-01`, `${anoMes}-${diasMes}`] }
      }
    }),
    MovimientoLote.count({
      where: {
        ...whereOrigen,
        id_transporte: { [Op.ne]: null },
        fecha_recepcion: null
      }
    })
  ]);

  return {
    lotesRegistradosMes:   lotesRegistradosMes   || 0,
    stockEnDeposito:       stockEnDeposito        || 0,
    movimientosDespachados: movimientosDespachados || 0,
    movimientosEnTransito: movimientosEnTransito  || 0
  };
}

// Función para calcular los KPIs del Enfermero
async function kpisEnfermero(id_usuario, alcance) {
  const { inicio: inicioHoy, fin: finHoy } = rangosDeHoy();
  const ahora = new Date();
  const whereUbic = alcance.global ? {} : { id_ubicacion: alcance.idUbicacion };

  const [misAplicacionesHoy, misAplicacionesDelMes, totalMisAplicaciones] = await Promise.all([
    Aplicacion.count({ where: { id_usuario, ...whereUbic, fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] } } }),
    Aplicacion.count({ where: { id_usuario, ...whereUbic, fecha_aplicacion: { [Op.gte]: new Date(ahora.getFullYear(), ahora.getMonth(), 1) } } }),
    Aplicacion.count({ where: { id_usuario, ...whereUbic } })
  ]);

  return {
    misAplicacionesHoy:    misAplicacionesHoy    || 0,
    misAplicacionesDelMes: misAplicacionesDelMes || 0,
    totalMisAplicaciones:  totalMisAplicaciones  || 0
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

const dashboard = {};

// Renderizar el dashboard con KPIs y últimas aplicaciones según el rol del usuario
dashboard.index = async (req, res) => {
  const { rol, id: id_usuario } = req.session.usuario;
  // Alcance de datos según la ubicación activa
  const alcance = alcanceUbicacion(req.session.usuario);
  const whereUbic = alcance.global ? {} : { id_ubicacion: alcance.idUbicacion };

  let kpis = {};
  let ultimasAplicaciones = [];
  let lotesAlerta = [];

  try {
    if (rol === 'Administrador') {
      kpis = await kpisAdmin(alcance);

      const [aplic, lotes] = await Promise.all([
        Aplicacion.findAll({ where: whereUbic, include: includeUltimasAplic, order: [['fecha_aplicacion', 'DESC']], limit: 5 }),
        Lote.findAll({
          where: { fecha_venc: { [Op.lte]: en30DiasStr() }, deletedAt: null },
          include: [
            { model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] },
            {
              model: Stock, as: 'stocks',
              attributes: ['cantidad'],
              where: { cantidad: { [Op.gt]: 0 } },
              required: false,
              include: [{ model: Ubicacion, as: 'ubicacion', attributes: ['nombre'] }]
            }
          ],
          order: [['fecha_venc', 'ASC']],
          limit: 8
        })
      ]);
      ultimasAplicaciones = aplic.map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));
      lotesAlerta = lotes;

    } else if (rol === 'Auditor') {
      kpis = await kpisAuditor(alcance);

      ultimasAplicaciones = (await Aplicacion.findAll({
        where: whereUbic,
        include: includeUltimasAplic,
        order: [['fecha_aplicacion', 'DESC']],
        limit: 5
      })).map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));

    } else if (rol === 'Enfermero') {
      kpis = await kpisEnfermero(id_usuario, alcance);

      ultimasAplicaciones = (await Aplicacion.findAll({
        where: { id_usuario, ...whereUbic },
        include: includeUltimasAplic,
        order: [['fecha_aplicacion', 'DESC']],
        limit: 5
      })).map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));

    } else if (rol === 'Administrativo') {
      kpis = await kpisAdministrativo(alcance);
    }

  } catch (error) {
    console.error('Error en dashboard:', error);
  }

  res.render('dashboard', {
    usuario: req.session.usuario,
    kpis,
    ultimasAplicaciones,
    lotesAlerta,
    fechaHoy: new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  });
};

module.exports = dashboard;
