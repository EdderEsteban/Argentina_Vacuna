const { Descarte, Lote, Vacuna, Ubicacion, Usuario, Stock, Estado } = require('../models');
const { Op } = require('sequelize');
const { idsEnScope } = require('../modules/permisos');

// Función para armar el filtro WHERE de descartes según el ámbito del usuario
function wherePorRol(sessionUser, scopeIds) {
  return scopeIds === null ? {} : { id_ubicacion: { [Op.in]: scopeIds } };
}

const descarte = {};

// Función para formatear fechas
function formatearFecha(fecha) {
  if (!fecha) return '';
  if (fecha instanceof Date) fecha = fecha.toISOString().split('T')[0]; 
  if (typeof fecha !== 'string') return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

const FORMAS_DESCARTE = [
  { valor: 'incineracion', etiqueta: 'Incineración' },
  { valor: 'autoclave', etiqueta: 'Autoclave' },
  { valor: 'reciclaje', etiqueta: 'Reciclaje' },
  { valor: 'vertido_controlado', etiqueta: 'Vertido controlado' },
  { valor: 'devolucion_proveedor', etiqueta: 'Devolución al proveedor' }
];

// Listar descartes con paginación y filtro desde el dashboard
descarte.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filtro = req.query.filtro || null;
    const limit = 10;
    const offset = (page - 1) * limit;

    const scopeIds = await idsEnScope(req.session.usuario);
    const where = wherePorRol(req.session.usuario, scopeIds);
    let filtroLabel = null;

    if (filtro === 'mes') {
      const ahora = new Date();
      const anoMes  = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
      const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
      where.fecha_descarte = { [Op.between]: [`${anoMes}-01`, `${anoMes}-${String(diasMes).padStart(2, '0')}`] };
      filtroLabel = `descartes de ${ahora.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}`;
    }

    const { count, rows } = await Descarte.findAndCountAll({
      where,
      include: [
        {
          model: Lote, as: 'lote', attributes: ['id', 'num_lote'],
          include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] }]
        },
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombre', 'apellido'] },
        { model: Ubicacion, as: 'ubicacion', attributes: ['id', 'nombre'] },
        { model: Estado, as: 'estado', attributes: ['nombre', 'codigo'] }
      ],
      distinct: true,
      order: [['fecha_descarte', 'DESC']],
      limit,
      offset
    });

    const descartes = rows.map(d => ({
      ...d.dataValues,
      fecha_descarte: formatearFecha(d.fecha_descarte),
      forma_descarte_label: FORMAS_DESCARTE.find(f => f.valor === d.forma_descarte)?.etiqueta || d.forma_descarte
    }));

    res.render('descarte/listadoDescarte', {
      descartes,
      filtro,
      filtroLabel,
      filtroParam: filtro ? `&filtro=${filtro}` : '',
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar descartes:', error);
    res.redirect('/500');
  }
};

// Mostrar formulario de nuevo descarte
descarte.mostrarNuevo = async (req, res) => {
  try {
    // Solo lotes con stock disponible en el ámbito del usuario
    const scopeIds = await idsEnScope(req.session.usuario);
    const stockWhere = { cantidad: { [Op.gt]: 0 } };
    if (scopeIds !== null) stockWhere.id_ubicacion = { [Op.in]: scopeIds };

    const stocks = await Stock.findAll({
      where: stockWhere,
      attributes: ['id_lote'],
      group: ['id_lote']
    });
    const idLotesConStock = stocks.map(s => s.id_lote);

    const lotesRaw = await Lote.findAll({
      where: { id: { [Op.in]: idLotesConStock }, deletedAt: null },
      include: [{ model: Vacuna, as: 'vacunas', attributes: ['tipo', 'nombre_comercial'] }],
      order: [['num_lote', 'ASC']]
    });

    // Marcar los lotes vencidos y ordenarlos primero
    const hoy = new Date().toISOString().split('T')[0];
    const lotes = lotesRaw
      .map(l => { const o = l.toJSON(); o.vencido = String(o.fecha_venc) < hoy; return o; })
      .sort((a, b) => (b.vencido ? 1 : 0) - (a.vencido ? 1 : 0));

    res.render('descarte/nuevoDescarte', {
      lotes,
      formas: FORMAS_DESCARTE,
      fechaHoy: hoy
    });
  } catch (error) {
    console.error('Error al cargar formulario de descarte:', error);
    res.redirect('/500');
  }
};

// Ruta para obtener las ubicaciones con stock de un lote
descarte.ubicacionesPorLote = async (req, res) => {
  try {
    const scopeIds = await idsEnScope(req.session.usuario);
    const where = { id_lote: req.params.id_lote, cantidad: { [Op.gt]: 0 } };
    if (scopeIds !== null) where.id_ubicacion = { [Op.in]: scopeIds };

    const stocks = await Stock.findAll({
      where,
      include: [{
        model: Ubicacion,
        as: 'ubicacion',
        where: { deletedAt: null },
        attributes: ['id', 'nombre', 'tipo']
      }]
    });

    const ubicaciones = stocks.map(s => ({
      id: s.ubicacion.id,
      nombre: s.ubicacion.nombre,
      tipo: s.ubicacion.tipo,
      stock: s.cantidad
    }));

    res.json(ubicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener ubicaciones' });
  }
};

// POST crear descarte
descarte.crearDescarte = async (req, res) => {
  try {
    const { id_lote, id_ubicacion, cantidad, fecha_descarte, forma_descarte, motivo } = req.body;
    const id_usuario = req.session?.usuario?.id;

    if (!id_usuario) {
      return res.status(401).json({ success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' });
    }

    if (!id_lote || !cantidad || !forma_descarte || !motivo) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // La ubicación es obligatoria porque el trigger descuenta del stock de esa ubicación
    if (!id_ubicacion) {
      return res.status(400).json({ success: false, message: 'La ubicación del descarte es obligatoria.' });
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser un número positivo.' });
    }

    // id_estado 4 = Descartada
    await Descarte.create({
      id_lote,
      id_usuario,
      id_ubicacion,
      cantidad: cantidadNum,
      fecha_descarte: fecha_descarte || new Date(),
      forma_descarte,
      motivo: motivo.trim(),
      id_estado: 4
    });

    res.status(201).json({ success: true, message: 'Descarte registrado correctamente.' });

  } catch (error) {
    console.error('Error al registrar descarte:', error);

    // Errores de trigger de BD
    const sqlMsg = error.parent?.sqlMessage || '';
    if (sqlMsg.toLowerCase().includes('stock') || sqlMsg.toLowerCase().includes('suficiente')) {
      return res.status(400).json({ success: false, message: 'No hay suficiente stock para descartar esa cantidad.' });
    }
    if (sqlMsg.toLowerCase().includes('vencido') || sqlMsg.toLowerCase().includes('estado')) {
      return res.status(400).json({ success: false, message: sqlMsg });
    }

    const errMsg = error.message || '';
    if (errMsg.toLowerCase().includes('stock') || errMsg.toLowerCase().includes('suficiente')) {
      return res.status(400).json({ success: false, message: errMsg });
    }

    const errores = error.errors?.map(e => ({ campo: e.path, mensaje: e.message }));
    res.status(400).json({
      success: false,
      message: errores?.[0]?.mensaje || errMsg || 'Error al registrar el descarte.',
      errores
    });
  }
};

module.exports = descarte;
