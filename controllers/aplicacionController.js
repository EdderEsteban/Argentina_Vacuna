const { Aplicacion, Paciente, Vacuna, Lote, Ubicacion, Usuario, Stock, Laboratorio } = require('../models');
const { Op } = require('sequelize');

const aplicacion = {};

// Construye el filtro WHERE según el rol: Auditor por ubicación, Enfermero por sus propias aplicaciones
function wherePorRol(sessionUser) {
  const { rol, id, ubicaciones = [], ubicacionActual } = sessionUser;
  const ids = ubicacionActual ? [ubicacionActual.id] : ubicaciones.map(u => u.id);
  if (rol === 'Auditor')   return { id_ubicacion: { [Op.in]: ids } };
  if (rol === 'Enfermero') return { id_usuario: id, id_ubicacion: { [Op.in]: ids } };
  return {};
}

// Convierte fecha YYYY-MM-DD a DD/MM/YYYY para mostrar en las vistas
function formatearFecha(fecha) {
  if (!fecha) return '';
  if (fecha instanceof Date) fecha = fecha.toISOString().split('T')[0];
  if (typeof fecha !== 'string') return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

// Listar aplicaciones con paginación, con soporte de filtro desde el dashboard
aplicacion.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filtro = req.query.filtro || null;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = wherePorRol(req.session.usuario);
    let filtroLabel = null;
    let filtroVariante = 'info';

    if (filtro === 'hoy') {
      const hoy = new Date();
      const inicio = new Date(hoy); inicio.setHours(0, 0, 0, 0);
      const fin    = new Date(hoy); fin.setHours(23, 59, 59, 999);
      where.fecha_aplicacion = { [Op.between]: [inicio, fin] };
      filtroLabel = 'aplicaciones de hoy';
    } else if (filtro === 'mes') {
      const ahora = new Date();
      const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const fin    = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
      where.fecha_aplicacion = { [Op.between]: [inicio, fin] };
      filtroLabel = `aplicaciones de ${ahora.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}`;
      filtroVariante = 'success';
    }

    const { count, rows } = await Aplicacion.findAndCountAll({
      where,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
        { model: Ubicacion, as: 'ubicacion', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        {
          model: Lote, as: 'lote', attributes: ['id', 'num_lote'],
          include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] }]
        }
      ],
      order: [['fecha_aplicacion', 'DESC']],
      limit,
      offset
    });

    const aplicaciones = rows.map(a => ({
      ...a.dataValues,
      fecha_aplicacion: formatearFecha(a.fecha_aplicacion)
    }));

    res.render('aplicacion/listadoAplicacion', {
      aplicaciones,
      filtro,
      filtroLabel,
      filtroVariante,
      filtroParam: filtro ? `&filtro=${filtro}` : '',
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar aplicaciones:', error);
    res.redirect('/500');
  }
};

// Mostrar formulario de nueva aplicación
aplicacion.mostrarNuevo = async (req, res) => {
  try {
    const { rol, ubicaciones: ubisSesion = [], ubicacionActual } = req.session.usuario;
    const ubiActual = ubicacionActual || ubisSesion[0] || null;
    const whereUbicacion = { tipo: 'Centro Vacunacion', deletedAt: null };
    if (rol === 'Enfermero') {
      whereUbicacion.id = ubiActual ? ubiActual.id : { [Op.in]: ubisSesion.map(u => u.id) };
    }

    const stocks = await Stock.findAll({
      where: { cantidad: { [Op.gt]: 0 } },
      attributes: ['id_lote'],
      include: [{ model: Ubicacion, as: 'ubicacion', where: whereUbicacion, attributes: [] }],
      group: ['id_lote']
    });

    const idLotesConStock = stocks.map(s => s.id_lote);

    const lotes = await Lote.findAll({
      where: {
        id: { [Op.in]: idLotesConStock },
        deletedAt: null,
        fecha_venc: { [Op.gte]: new Date() }
      },
      include: [
        { model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] },
        { model: Laboratorio, as: 'laboratorio', attributes: ['nombre'] }
      ],
      order: [['num_lote', 'ASC']]
    });

    res.render('aplicacion/nuevoAplicacion', {
      lotes,
      fechaHoy: new Date().toISOString().split('T')[0],
      ubicacionUsuario: ubiActual
    });
  } catch (error) {
    console.error('Error al cargar formulario:', error);
    res.redirect('/500');
  }
};

// GET /aplicaciones/ubicaciones/:id_lote — ubicaciones Centro Vacunacion con stock del lote
aplicacion.ubicacionesPorLote = async (req, res) => {
  try {
    const { rol, ubicaciones: ubisSesion = [] } = req.session.usuario;
    const whereUbicacion = { tipo: 'Centro Vacunacion', deletedAt: null };
    if (rol === 'Enfermero') whereUbicacion.id = { [Op.in]: ubisSesion.map(u => u.id) };

    const stocks = await Stock.findAll({
      where: { id_lote: req.params.id_lote, cantidad: { [Op.gt]: 0 } },
      include: [{ model: Ubicacion, as: 'ubicacion', where: whereUbicacion, attributes: ['id', 'nombre'] }]
    });

    const ubicaciones = stocks.map(s => ({
      id: s.ubicacion.id,
      nombre: s.ubicacion.nombre,
      stock: s.cantidad
    }));

    res.json(ubicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener ubicaciones' });
  }
};

// GET /aplicaciones/buscar-paciente — busca paciente por DNI para el formulario
aplicacion.buscarPacientePorDni = async (req, res) => {
  try {
    const { dni } = req.query;
    if (!dni) return res.status(400).json({ success: false, message: 'DNI requerido' });

    const paciente = await Paciente.findOne({
      where: { dni: dni.trim(), deletedAt: null },
      attributes: ['id', 'nombre', 'apellido', 'dni', 'fecha_nacimiento']
    });

    if (!paciente) {
      return res.status(404).json({ success: false, message: 'No se encontró ningún paciente con ese DNI.' });
    }

    res.json({ success: true, paciente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al buscar paciente' });
  }
};

// POST crear aplicación
aplicacion.crearAplicacion = async (req, res) => {
  try {
    const { id_paciente, id_lote, fecha_aplicacion } = req.body;
    const id_usuario = req.session?.usuario?.id;
    const sesionUbis = req.session?.usuario?.ubicaciones || [];
    const ubiActual = req.session?.usuario?.ubicacionActual;

    // id_ubicacion viene del hidden input (pre-poblado desde sesión); se valida que pertenezca al usuario
    const id_ubicacion_body = req.body.id_ubicacion;
    const validIds = ubiActual ? [ubiActual.id] : sesionUbis.map(u => u.id);
    const id_ubicacion = validIds.some(id => id == id_ubicacion_body)
      ? id_ubicacion_body
      : (ubiActual?.id || sesionUbis[0]?.id);

    if (!id_usuario) {
      return res.status(401).json({ success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' });
    }

    // Validar campos obligatorios
    if (!id_paciente || !id_lote || !id_ubicacion) {
      return res.status(400).json({ success: false, message: 'Paciente, lote y ubicación son obligatorios.' });
    }

    // Obtener la vacuna del lote
    const vacuna = await Vacuna.findOne({ where: { id_lote, deletedAt: null } });
    if (!vacuna) {
      return res.status(400).json({ success: false, message: 'No se encontró la vacuna para este lote.' });
    }

    await Aplicacion.create({
      id_vacuna: vacuna.id,
      id_paciente,
      id_lote,
      id_ubicacion,
      id_usuario,
      fecha_aplicacion: fecha_aplicacion || new Date()
    });

    res.status(201).json({ success: true, message: 'Vacuna aplicada y registrada correctamente.' });

  } catch (error) {
    console.error('Error al registrar aplicación:', error);

    // Error del trigger de BD: vacuna vencida (SQLSTATE 45000)
    const sqlMsg = error.parent?.sqlMessage || '';
    if (sqlMsg.toLowerCase().includes('vencida') || error.parent?.errno === 1644) {
      return res.status(400).json({
        success: false,
        vencida: true,
        message: 'No se puede aplicar una vacuna vencida. Registre el descarte del lote correspondiente.'
      });
    }

    // Error de stock insuficiente (hook beforeCreate)
    const errMsg = error.message || '';
    if (errMsg.toLowerCase().includes('stock') || errMsg.toLowerCase().includes('disponible')) {
      return res.status(400).json({ success: false, message: errMsg });
    }

    res.status(500).json({ success: false, message: errMsg || 'Error al registrar la aplicación.' });
  }
};

// Mostrar formulario de búsqueda de aplicaciones
aplicacion.mostrarBuscar = async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.findAll({
      where: { tipo: 'Centro Vacunacion', deletedAt: null },
      order: [['nombre', 'ASC']]
    });
    res.render('aplicacion/buscarAplicacion', { ubicaciones });
  } catch (error) {
    console.error(error);
    res.redirect('/500');
  }
};

// Buscar aplicaciones con filtros (devuelve JSON para el frontend)
aplicacion.buscarAplicaciones = async (req, res) => {
  try {
    const { dni, id_ubicacion, fecha_desde, fecha_hasta, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    const wherePaciente = {};
    if (dni) wherePaciente.dni = { [Op.like]: `${dni.trim()}%` };

    const whereAplicacion = wherePorRol(req.session.usuario);
    if (id_ubicacion) whereAplicacion.id_ubicacion = id_ubicacion;
    if (fecha_desde || fecha_hasta) {
      whereAplicacion.fecha_aplicacion = {};
      if (fecha_desde) whereAplicacion.fecha_aplicacion[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) whereAplicacion.fecha_aplicacion[Op.lte] = new Date(fecha_hasta + 'T23:59:59');
    }

    const { count, rows } = await Aplicacion.findAndCountAll({
      where: whereAplicacion,
      include: [
        {
          model: Paciente, as: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'dni'],
          where: Object.keys(wherePaciente).length ? wherePaciente : undefined
        },
        { model: Ubicacion, as: 'ubicacion', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        {
          model: Lote, as: 'lote', attributes: ['id', 'num_lote'],
          include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] }]
        }
      ],
      order: [['fecha_aplicacion', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    const aplicaciones = rows.map(a => ({
      id: a.id,
      fecha_aplicacion: formatearFecha(a.fecha_aplicacion),
      paciente: a.paciente,
      ubicacion: a.ubicacion,
      usuario: a.usuario,
      lote: a.lote
    }));

    res.json({
      aplicaciones,
      pagination: {
        totalItems: count,
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPreviousPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error en búsqueda de aplicaciones:', error);
    res.status(500).json({ success: false, message: 'Error en la búsqueda' });
  }
};

module.exports = aplicacion;
