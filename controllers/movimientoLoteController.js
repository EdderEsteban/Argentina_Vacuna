const { MovimientoLote, Lote, Ubicacion, Stock, Vacuna, Estado } = require('../models');
const { Op } = require('sequelize');

const movimiento = {};

// Listar movimientos con paginación
movimiento.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await MovimientoLote.findAndCountAll({
      include: [
        { model: Lote, as: 'lote', attributes: ['id', 'num_lote'] },
        { model: Ubicacion, as: 'origen', attributes: ['id', 'nombre', 'tipo'] },
        { model: Ubicacion, as: 'destino', attributes: ['id', 'nombre', 'tipo'] },
        {
          model: Lote, as: 'lote', attributes: ['id', 'num_lote'],
          include: [
            {
              model: Vacuna, as: 'vacunas', limit: 1,
              include: [
                { model: Estado, as: 'estado', attributes: ['nombre', 'codigo'] }
              ]
            }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.render('movimiento/listadoMovimiento', {
      movimientos: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al listar movimientos:', error);
    res.redirect('/500');
  }
};

// Mostrar formulario de nuevo movimiento
movimiento.mostrarNuevo = async (req, res) => {
  try {
    const lotes = await Lote.findAll({
      where: { deletedAt: null },
      order: [['num_lote', 'ASC']]
    });

    const ubicaciones = await Ubicacion.findAll({
      where: { deletedAt: null },
      order: [['nombre', 'ASC']]
    });

    res.render('movimiento/nuevoMovimiento', { lotes, ubicaciones });
  } catch (error) {
    console.error('Error al cargar formulario:', error);
    res.redirect('/500');
  }
};

// Crear movimiento
movimiento.crearMovimiento = async (req, res) => {
  try {
    const { id_lote, id_ubicacion_origen, id_ubicacion_destino, cantidad, fecha_movimiento } = req.body;

    // Validar stock
    const stock = await Stock.findOne({
      where: {
        id_lote,
        id_ubicacion: id_ubicacion_origen
      }
    });

    if (!stock || stock.cantidad < parseInt(cantidad)) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente en la ubicación de origen'
      });
    }

    // Validar origen ≠ destino
    if (id_ubicacion_origen === id_ubicacion_destino) {
      return res.status(400).json({
        success: false,
        message: 'El origen y destino no pueden ser iguales'
      });
    }

    const movimiento = await MovimientoLote.create({
      id_lote,
      id_ubicacion_origen: id_ubicacion_origen || null,
      id_ubicacion_destino,
      cantidad,
      fecha_movimiento
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento registrado exitosamente',
      data: movimiento
    });

  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ success: false, message: 'Error al registrar movimiento' });
  }
};

module.exports = movimiento;