const { Aplicacion, Descarte, Lote, Vacuna, Ubicacion, Stock, Paciente } = require('../models');
const { Op } = require('sequelize');

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

// Calcula los KPIs del Administrador: aplicaciones, stock nacional, lotes por vencer, descartes y pacientes
async function kpisAdmin() {
  const { inicio: inicioHoy, fin: finHoy }   = rangosDeHoy();
  const { inicio: inicioMes, fin: finMes }   = rangosDelMes();

  // Deposito Nacional → IDs
  const depNac = await Ubicacion.findAll({ where: { tipo: 'Deposito Nacional' }, attributes: ['id'] });
  const idsDepNac = depNac.map(u => u.id);

  const [
    aplicacionesHoy,
    aplicacionesDelMes,
    stockNacional,
    lotesProximosVencer,
    descartesDelMes,
    totalPacientes
  ] = await Promise.all([
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] } } }),
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioMes, finMes] } } }),
    Stock.sum('cantidad', { where: { id_ubicacion: { [Op.in]: idsDepNac } } }),
    Lote.count({ where: { fecha_venc: { [Op.lte]: en30DiasStr() }, deletedAt: null } }),
    Descarte.count({ where: { fecha_descarte: { [Op.between]: [hoyStr().slice(0, 7) + '-01', en30DiasStr()] } } }),
    Paciente.count({ where: { deletedAt: null } })
  ]);

  // Descartes del mes (uso strings para campo DATE)
  const ahora = new Date();
  const anoMes   = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const diasMes  = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  const descartesDelMesReal = await Descarte.count({
    where: { fecha_descarte: { [Op.between]: [`${anoMes}-01`, `${anoMes}-${diasMes}`] } }
  });

  return {
    aplicacionesHoy:     aplicacionesHoy     || 0,
    aplicacionesDelMes:  aplicacionesDelMes  || 0,
    stockNacional:       stockNacional        || 0,
    lotesProximosVencer: lotesProximosVencer  || 0,
    descartesDelMes:     descartesDelMesReal  || 0,
    totalPacientes:      totalPacientes       || 0
  };
}

// Calcula los KPIs del Auditor filtrados por sus ubicaciones asignadas
async function kpisAuditor(idsUbicaciones) {
  const { inicio: inicioHoy, fin: finHoy } = rangosDeHoy();
  const ahora = new Date();
  const anoMes  = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();

  const [aplicacionesHoy, aplicacionesDelMes, stockUbicaciones, descartesDelMes] = await Promise.all([
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] }, id_ubicacion: { [Op.in]: idsUbicaciones } } }),
    Aplicacion.count({ where: { fecha_aplicacion: { [Op.gte]: new Date(ahora.getFullYear(), ahora.getMonth(), 1) }, id_ubicacion: { [Op.in]: idsUbicaciones } } }),
    Stock.sum('cantidad', { where: { id_ubicacion: { [Op.in]: idsUbicaciones } } }),
    Descarte.count({ where: { fecha_descarte: { [Op.between]: [`${anoMes}-01`, `${anoMes}-${diasMes}`] }, id_ubicacion: { [Op.in]: idsUbicaciones } } })
  ]);

  return {
    aplicacionesHoy:    aplicacionesHoy    || 0,
    aplicacionesDelMes: aplicacionesDelMes || 0,
    stockUbicaciones:   stockUbicaciones   || 0,
    descartesDelMes:    descartesDelMes    || 0
  };
}

// Calcula los KPIs del Enfermero: sus aplicaciones del día, del mes e históricas
async function kpisEnfermero(id_usuario) {
  const { inicio: inicioHoy, fin: finHoy } = rangosDeHoy();
  const ahora = new Date();

  const [misAplicacionesHoy, misAplicacionesDelMes, totalMisAplicaciones] = await Promise.all([
    Aplicacion.count({ where: { id_usuario, fecha_aplicacion: { [Op.between]: [inicioHoy, finHoy] } } }),
    Aplicacion.count({ where: { id_usuario, fecha_aplicacion: { [Op.gte]: new Date(ahora.getFullYear(), ahora.getMonth(), 1) } } }),
    Aplicacion.count({ where: { id_usuario } })
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
  const { rol, id: id_usuario, ubicaciones: ubisSesion = [] } = req.session.usuario;
  const idsUbicaciones = ubisSesion.map(u => u.id);

  let kpis = {};
  let ultimasAplicaciones = [];
  let lotesAlerta = [];

  try {
    if (rol === 'Administrador') {
      kpis = await kpisAdmin();

      const [aplic, lotes] = await Promise.all([
        Aplicacion.findAll({ include: includeUltimasAplic, order: [['fecha_aplicacion', 'DESC']], limit: 5 }),
        Lote.findAll({
          where: { fecha_venc: { [Op.lte]: en30DiasStr() }, deletedAt: null },
          include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] }],
          order: [['fecha_venc', 'ASC']],
          limit: 8
        })
      ]);
      ultimasAplicaciones = aplic.map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));
      lotesAlerta = lotes;

    } else if (rol === 'Auditor') {
      kpis = await kpisAuditor(idsUbicaciones);

      ultimasAplicaciones = (await Aplicacion.findAll({
        where: { id_ubicacion: { [Op.in]: idsUbicaciones } },
        include: includeUltimasAplic,
        order: [['fecha_aplicacion', 'DESC']],
        limit: 5
      })).map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));

    } else if (rol === 'Enfermero') {
      kpis = await kpisEnfermero(id_usuario);

      ultimasAplicaciones = (await Aplicacion.findAll({
        where: { id_usuario },
        include: includeUltimasAplic,
        order: [['fecha_aplicacion', 'DESC']],
        limit: 5
      })).map(a => ({ ...a.dataValues, fecha_aplicacion: formatearFechaHora(a.fecha_aplicacion) }));
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
