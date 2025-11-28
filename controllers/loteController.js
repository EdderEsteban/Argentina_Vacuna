const { Lote } = require('../models');
const { Laboratorio } = require('../models');
const { Vacuna } = require('../models');
const { Estado } = require('../models');
const { Op } = require('sequelize');

const lote = {};

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

// Listar lotes con sus laboratorios y vacunas asociadas
lote.listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Obtener todos los lotes con sus laboratorios y vacunas asociadas
        const { count, rows: lotes } = await Lote.findAndCountAll({
            where: { deletedAt: null },
            include: [
                {
                    model: Laboratorio,
                    as: 'laboratorio'
                },
                {
                    model: Vacuna,
                    as: 'vacunas',
                    limit: 1,
                    include: [
                        {
                            model: Estado,
                            as: 'estado'
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']],
            limit,
            offset
        });

        // Formatear fechas de los lotes y preparar los datos de las vacunas
        const lotesFormateados = lotes.map(lote => {
            const fechasFormateadas = {
                fecha_fab: formatearFecha(lote.fecha_fab),
                fecha_venc: formatearFecha(lote.fecha_venc),
                fecha_compra: formatearFecha(lote.fecha_compra)
            };

            // Agrupar vacunas por tipo y nombre_comercial para evitar duplicados
            const vacunasAgrupadas = [];
            const vacunasVistas = new Set();

            lote.vacunas.forEach(vacuna => {
                const clave = `${vacuna.tipo}-${vacuna.nombre_comercial}`;
                if (!vacunasVistas.has(clave)) {
                    vacunasVistas.add(clave);
                    vacunasAgrupadas.push({
                        id: vacuna.id,
                        tipo: vacuna.tipo,
                        nombre_comercial: vacuna.nombre_comercial
                    });
                }
            });

            return {
                ...lote.dataValues,
                ...fechasFormateadas,
                vacunas: vacunasAgrupadas
            };
        });

        const totalPages = Math.ceil(count / limit);

        res.render('lote/listadoLote', {
            lotes: lotesFormateados,
            pagination: {
                currentPage: page,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        });

    } catch (error) {
        console.error('Error al listar lotes:', error);
        res.redirect('/404');
    }
};

// Mostrar formulario de creación de nuevo lote
lote.mostrarNuevo = async (req, res) => {
    try {
        // Obtener todos los laboratorios activos
        const laboratorios = await Laboratorio.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });

        res.render('lote/nuevoLote', {
            laboratorios
        });
    } catch (error) {
        res.redirect('/404');
    }
}

// POST Crear nuevo lote y sus vacunas
lote.crearLote = async (req, res) => {
  try {
    const {
      numLote,
      id_laboratorio,
      cantidad,
      fecha_fab,
      fecha_venc,
      fecha_compra,
      tipo_vacuna,
      nombre_comercial
    } = req.body;

    // Validaciones básicas
    if (!cantidad || !/^\d+$/.test(cantidad) || parseInt(cantidad) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un número entero positivo mayor que cero.'
      });
    }

    const loteExistente = await Lote.findOne({ where: { num_lote: numLote.trim() } });
    if (loteExistente) {
      return res.status(400).json({
        success: false,
        message: 'El número de lote ya existe.'
      });
    }

    // Crear el lote
    const nuevoLote = await Lote.create({
      num_lote: numLote.trim(),
      id_laboratorio,
      cantidad: parseInt(cantidad),
      fecha_fab,
      fecha_venc,
      fecha_compra
    });

    // ✅ Crear solo 1 fila en Vacuna (tipo de vacuna dentro del lote)
    await Vacuna.create({
      id_lote: nuevoLote.id,
      tipo: tipo_vacuna.trim(),
      nombre_comercial: nombre_comercial.trim(),
      id_estado: 1 // Disponible
    });

    // ✅ Inicializar stock en depósito nacional
    await Stock.create({
      id_lote: nuevoLote.id,
      id_ubicacion: 1, // ID del depósito nacional
      cantidad: parseInt(cantidad)
    });

    res.status(201).json({
      success: true,
      message: 'Lote, vacuna y stock creados exitosamente',
      data: nuevoLote
    });

  } catch (error) {
    console.error('Error detallado:', JSON.stringify(error, null, 2));
    const errores = error.errors?.map(err => ({
      campo: err.path,
      mensaje: err.message
    })) || [{ mensaje: 'Error desconocido' }];

    res.status(400).json({
      success: false,
      message: 'Error al crear lote',
      errores
    });
  }
};

// Mostrar formulario de edición de lote
lote.editarLote = async (req, res) => {
    try {
        const lote = await Lote.findByPk(req.params.id, {
            include: [
                {
                    model: Laboratorio,
                    as: 'laboratorio'
                },
                {
                    model: Vacuna,
                    as: 'vacunas'
                }
            ]
        });

        if (!lote) {
            return res.redirect('/lotes');
        }

        const laboratorios = await Laboratorio.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });

        res.render('lote/modificarLote', {
            lote,
            laboratorios
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/404');
    }
};

// Actualizar lote y sus vacunas asociadas
lote.actualizarLote = async (req, res) => {
  try {
    const loteId = req.params.id;
    const lote = await Lote.findByPk(loteId);

    if (!lote) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    // Validación de cantidad
    const nuevaCantidad = parseInt(req.body.cantidad);
    if (!req.body.cantidad || !/^\d+$/.test(req.body.cantidad) || nuevaCantidad <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar lote',
        errores: [{
          campo: 'cantidad',
          mensaje: 'La cantidad debe ser un número entero positivo mayor que cero.'
        }]
      });
    }

    // Actualizar el lote
    await lote.update({
      num_lote: req.body.numLote.trim(),
      id_laboratorio: req.body.id_laboratorio,
      cantidad: nuevaCantidad,
      fecha_fab: req.body.fecha_fab,
      fecha_venc: req.body.fecha_venc,
      fecha_compra: req.body.fecha_compra
    });

    //  Actualizar Vacuna asociada al lote
    await Vacuna.update(
      {
        tipo: req.body.tipo_vacuna.trim(),
        nombre_comercial: req.body.nombre_comercial.trim()
      },
      { where: { id_lote: loteId } }
    );

    //  Ajustar el stock total #REVISAR UBICACION#
    const stock = await Stock.findOne({
      where: { id_lote: loteId }
    });

    if (stock) {
      stock.cantidad = nuevaCantidad;
      await stock.save();
    }

    res.json({
      success: true,
      message: 'Lote, vacuna y stock actualizados exitosamente',
      data: lote
    });

  } catch (error) {
    console.error('Error detallado:', JSON.stringify(error, null, 2));
    const errores = error.errors?.map(err => ({
      campo: err.path,
      mensaje: err.message
    })) || [{ mensaje: 'Error desconocido' }];

    res.status(400).json({
      success: false,
      message: 'Error al actualizar lote',
      errores
    });
  }
};

// Eliminar lote (soft delete)
lote.borrarLote = async (req, res) => {
    try {
        await Lote.destroy({
            where: { id: req.params.id }
        });
        await Vacuna.destroy({
            where: { id_lote: req.params.id }
        });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Formulario vista de búsqueda de lotes
lote.mostrarBuscar = async (req, res) => {
    try {
        const laboratorios = await Laboratorio.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });

        res.render('lote/buscarLote', {
            laboratorios
        });

    } catch (error) {
        console.error('Error al cargar formulario de búsqueda:', error);
        res.redirect('/404');
    }
};

// Buscador de lotes
lote.buscarLotes = async (req, res) => {
    try {
        const {
            numLote,
            id_laboratorio,
            fecha_compra,
            fecha_venc,
            tipo_vacuna,
            nombre_comercial_vacuna,
            page = 1
        } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const whereLote = {};
        if (numLote) whereLote.num_lote = { [Op.like]: `${numLote}%` };
        if (id_laboratorio) whereLote.id_laboratorio = id_laboratorio;

        // Ajustar fecha_compra para filtrar por mes y año
        if (fecha_compra) {
            const [anio, mes] = fecha_compra.split('-');
            const startOfMonth = new Date(anio, mes - 1, 1);
            const endOfMonth = new Date(anio, mes, 0);
            whereLote.fecha_compra = { [Op.between]: [startOfMonth, endOfMonth] };
        }

        // Ajustar fecha_venc para filtrar por mes y año
        if (fecha_venc) {
            const [anio, mes] = fecha_venc.split('-');
            const startOfMonth = new Date(anio, mes - 1, 1);
            const endOfMonth = new Date(anio, mes, 0);
            whereLote.fecha_venc = { [Op.between]: [startOfMonth, endOfMonth] };
        }

        // Consulta con joins para incluir vacunas y su tipo y nombre comercial
        const { count, rows } = await Lote.findAndCountAll({
            where: whereLote,
            limit,
            offset,
            order: [['id', 'ASC']],
            include: [
                {
                    model: Laboratorio,
                    as: 'laboratorio',
                    attributes: ['id', 'nombre']
                },
                {
                    model: Vacuna,
                    as: 'vacunas',
                    attributes: ['id', 'tipo', 'nombre_comercial'],
                    limit: 1 // Limitar a una vacuna por lote
                }
            ]
        });

        // Formatear fechas de los lotes
        const lotesFormateados = rows.map(lote => {
            return {
                ...lote.dataValues,
                fecha_fab: formatearFecha(lote.fecha_fab),
                fecha_venc: formatearFecha(lote.fecha_venc),
                fecha_compra: formatearFecha(lote.fecha_compra)
            };
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            lotes: lotesFormateados,
            pagination: {
                totalItems: count,
                currentPage: parseInt(page),
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
       
    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
 
module.exports = lote;