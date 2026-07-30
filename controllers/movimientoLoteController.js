const { MovimientoLote, Lote, Ubicacion, Stock, Vacuna, Estado, Transporte } = require('../models');
const { Op } = require('sequelize');
const { idsEnScope } = require('../modules/permisos');

const movimiento = {};

// Listar movimientos con paginación (filtrado por ubicación para roles no-Admin)
movimiento.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { rol } = req.session.usuario;
    const scopeIds = await idsEnScope(req.session.usuario);
    let where = {};
    if (scopeIds !== null) {
      // Fuera del nivel nacional, solo movimientos del ámbito del usuario
      if (rol === 'Enfermero') {
        // El enfermero solo ve los movimientos que llegan a su centro
        where = { id_ubicacion_destino: { [Op.in]: scopeIds } };
      } else {
        // Los demás ven los movimientos donde su ámbito es origen o destino
        where = {
          [Op.or]: [
            { id_ubicacion_origen: { [Op.in]: scopeIds } },
            { id_ubicacion_destino: { [Op.in]: scopeIds } }
          ]
        };
      }
    }

    const { count, rows } = await MovimientoLote.findAndCountAll({
      where,
      include: [
        {
          model: Lote, as: 'lote', attributes: ['id', 'num_lote'],
          include: [{
            model: Vacuna, as: 'vacunas',
            include: [{ model: Estado, as: 'estado', attributes: ['nombre', 'codigo'] }]
          }]
        },
        { model: Ubicacion, as: 'origen',  attributes: ['id', 'nombre', 'tipo'] },
        { model: Ubicacion, as: 'destino', attributes: ['id', 'nombre', 'tipo'] },
        { model: Transporte, as: 'transporte', attributes: ['id', 'nombre', 'id_movil'] }
      ],
      distinct: true,
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
    const [lotes, ubicaciones, transportes, depositoNacional] = await Promise.all([
      Lote.findAll({ where: { deletedAt: null }, order: [['num_lote', 'ASC']] }),
      Ubicacion.findAll({ where: { deletedAt: null }, order: [['nombre', 'ASC']] }),
      Transporte.findAll({ where: { deletedAt: null }, order: [['nombre', 'ASC'], ['id_movil', 'ASC']] }),
      Ubicacion.findOne({ where: { tipo: 'Deposito Nacional', deletedAt: null } })
    ]);

    res.render('movimiento/nuevoMovimiento', {
      lotes,
      ubicaciones,
      transportes,
      depositoNacionalId: depositoNacional?.id || null
    });
  } catch (error) {
    console.error('Error al cargar formulario:', error);
    res.redirect('/500');
  }
};

// Crear movimiento
movimiento.crearMovimiento = async (req, res) => {
  try {
    const { id_lote, id_ubicacion_origen, id_ubicacion_destino, cantidad, fecha_movimiento, id_transporte } = req.body;

    // Validaciones explícitas (antes el controller delegaba en el trigger BD,
    // que devolvía 500 para casos triviales como cantidad negativa o IDs nulos).
    if (!id_lote) {
      return res.status(400).json({ success: false, message: 'Debe seleccionar un lote.' });
    }
    if (!id_ubicacion_origen) {
      return res.status(400).json({ success: false, message: 'Debe seleccionar una ubicación de origen.' });
    }
    if (!id_ubicacion_destino) {
      return res.status(400).json({ success: false, message: 'Debe seleccionar una ubicación de destino.' });
    }
    if (!fecha_movimiento) {
      return res.status(400).json({ success: false, message: 'Debe especificar la fecha del movimiento.' });
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser un número entero mayor a 0.' });
    }

    // Comparación robusta origen != destino (parseInt evita falso negativo con tipos mixtos)
    if (parseInt(id_ubicacion_origen) === parseInt(id_ubicacion_destino)) {
      return res.status(400).json({ success: false, message: 'El origen y destino no pueden ser iguales.' });
    }

    // Validar que las ubicaciones existan
    const [ubiOrigen, ubiDestino] = await Promise.all([
      Ubicacion.findByPk(id_ubicacion_origen),
      Ubicacion.findByPk(id_ubicacion_destino)
    ]);
    if (!ubiOrigen)  return res.status(400).json({ success: false, message: 'La ubicación de origen no existe.' });
    if (!ubiDestino) return res.status(400).json({ success: false, message: 'La ubicación de destino no existe.' });

    // Administrativo solo puede despachar desde sus ubicaciones asignadas
    const { rol, ubicaciones } = req.session.usuario;
    if (rol === 'Administrativo') {
      const misIds = ubicaciones.map(u => u.id);
      if (!misIds.includes(parseInt(id_ubicacion_origen))) {
        return res.status(403).json({ success: false, message: 'Solo puede crear movimientos desde sus ubicaciones asignadas.' });
      }
    }

    // Validar stock en origen
    const stock = await Stock.findOne({ where: { id_lote, id_ubicacion: id_ubicacion_origen } });
    if (!stock || stock.cantidad < cantidadNum) {
      return res.status(400).json({ success: false, message: 'Stock insuficiente en la ubicación de origen.' });
    }

    const nuevoMovimiento = await MovimientoLote.create({
      id_lote,
      id_ubicacion_origen,
      id_ubicacion_destino,
      id_usuario_origen: req.session.usuario.id,
      cantidad: cantidadNum,
      fecha_movimiento,
      id_transporte: id_transporte || null
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento registrado exitosamente',
      data: nuevoMovimiento
    });

  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ success: false, message: 'Error al registrar movimiento' });
  }
};

// Registrar recepción de un movimiento en tránsito.
// Solo el destinatario (usuario asignado a la ubicación destino) o el Administrador
// pueden confirmar la llegada. Sin esta validación, cualquier Administrativo/Enfermero
// podría recepcionar movimientos de cualquier centro.
movimiento.registrarRecepcion = async (req, res) => {
  try {
    const { id } = req.params;
    const mov = await MovimientoLote.findByPk(id);
    if (!mov) return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    if (!mov.id_transporte) return res.status(400).json({ success: false, message: 'El movimiento no tiene transporte asociado' });
    if (mov.fecha_recepcion) return res.status(400).json({ success: false, message: 'El movimiento ya fue recibido' });

    // Autorización por ubicación: el destino del movimiento debe pertenecer al usuario
    const sess = req.session.usuario;
    if (sess.rol !== 'Administrador') {
      const ubiIds = (sess.ubicaciones || []).map(u => u.id);
      if (!ubiIds.includes(mov.id_ubicacion_destino)) {
        return res.status(403).json({
          success: false,
          message: 'Solo puede confirmar recepciones destinadas a sus ubicaciones asignadas.'
        });
      }
    }

    await mov.update({
      fecha_recepcion: new Date(),
      id_usuario_destino: sess.id
    });

    res.json({ success: true, message: 'Recepción registrada exitosamente' });
  } catch (error) {
    console.error('Error al registrar recepción:', error);
    res.status(500).json({ success: false, message: 'Error al registrar la recepción' });
  }
};

module.exports = movimiento;
