const { Transporte, MovimientoLote } = require('../models');

const transporteCtrl = {};

// Listar transportes con paginación
transporteCtrl.listar = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transporte.findAndCountAll({
      order: [['nombre', 'ASC'], ['id_movil', 'ASC']],
      limit,
      offset
    });

    res.render('transporte/listadoTransporte', {
      transportes: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar transportes:', error);
    res.redirect('/500');
  }
};

// Mostrar formulario de nuevo transporte
transporteCtrl.mostrarNuevo = (req, res) => {
  res.render('transporte/nuevoTransporte');
};

// Crear transporte
transporteCtrl.crearTransporte = async (req, res) => {
  try {
    const { nombre, id_movil } = req.body;
    if (!nombre?.trim() || !id_movil?.trim()) {
      return res.status(400).json({ success: false, message: 'Nombre e identificador de móvil son obligatorios' });
    }

    const existe = await Transporte.findOne({ where: { nombre: nombre.trim(), id_movil: id_movil.trim() } });
    if (existe) {
      return res.status(400).json({ success: false, message: 'Ya existe un transporte con esa empresa e identificador de móvil.' });
    }

    const transporte = await Transporte.create({ nombre: nombre.trim(), id_movil: id_movil.trim() });
    res.status(201).json({ success: true, message: 'Transporte registrado correctamente', data: transporte });
  } catch (error) {
    console.error('Error al crear transporte:', error);
    res.status(500).json({ success: false, message: 'Error al registrar el transporte' });
  }
};

// Borrar transporte (soft delete). Bloquea la operación si el transporte está
// usado por movimientos aún en tránsito (sin recepción confirmada), para no
// dejar movimientos con FK apuntando a un transporte eliminado.
transporteCtrl.borrarTransporte = async (req, res) => {
  try {
    const transporte = await Transporte.findByPk(req.params.id);
    if (!transporte) return res.status(404).json({ success: false, message: 'Transporte no encontrado' });

    const enUso = await MovimientoLote.count({
      where: { id_transporte: req.params.id, fecha_recepcion: null }
    });
    if (enUso > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: hay ${enUso} movimiento(s) en tránsito asignado(s) a este transporte.`
      });
    }

    await transporte.destroy();
    res.json({ success: true, message: 'Transporte eliminado' });
  } catch (error) {
    console.error('Error al borrar transporte:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el transporte' });
  }
};

module.exports = transporteCtrl;
