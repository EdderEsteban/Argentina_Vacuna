const { Lote } = require('../models');
const { Laboratorio } = require('../models');
const { Op } = require('sequelize');

const lote = {};

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

// Listar lotes con paginación
lote.listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Página actual (default: 1)
        const limit = 10; // Lotes por página
        const offset = (page - 1) * limit;

        const { count, rows: lotes } = await Lote.findAndCountAll({
            where: { deletedAt: null },
            include: [{
                model: Laboratorio,
                as: 'laboratorio',
                attributes: ['id', 'nombre']
            }],
            order: [['id', 'ASC']],
            limit,
            offset
        });

        // Formatear fechas de los lotes
        const lotesFormateados = lotes.map(lote => {
            return {
                ...lote.dataValues,
                fecha_fab: formatearFecha(lote.fecha_fab),
                fecha_venc: formatearFecha(lote.fecha_venc),
                fecha_compra: formatearFecha(lote.fecha_compra)
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

// POST Crear nuevo lote
lote.crearLote = async (req, res) => {
    try {
        // Validación de cantidad
        if (!req.body.cantidad || !/^\d+$/.test(req.body.cantidad) || parseInt(req.body.cantidad) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear lote',
                errores: [{
                    campo: 'cantidad',
                    mensaje: 'La cantidad debe ser un número entero positivo mayor que cero.'
                }]
            });
        }

        const nuevoLote = await Lote.create({
            num_lote: req.body.numLote.trim(),
            id_laboratorio: req.body.id_laboratorio,
            cantidad: req.body.cantidad,
            fecha_fab: req.body.fecha_fab,
            fecha_venc: req.body.fecha_venc,
            fecha_compra: req.body.fecha_compra
        });

        res.status(201).json({
            success: true,
            message: 'Lote creado exitosamente',
            data: nuevoLote
        });

    } catch (error) {
        console.error('Error detallado:', JSON.stringify(error, null, 2));
        // Manejo de errores de Sequelize
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
        // Obtener el lote por ID
        const lote = await Lote.findByPk(req.params.id);
        // Obtener todos los laboratorios activos
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

// Actualizar lote
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
        if (!req.body.cantidad || !/^\d+$/.test(req.body.cantidad) || parseInt(req.body.cantidad) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Error al actualizar lote',
                errores: [{
                    campo: 'cantidad',
                    mensaje: 'La cantidad debe ser un número entero positivo mayor que cero.'
                }]
            });
        }

        await lote.update({
            num_lote: req.body.numLote.trim(),
            id_laboratorio: req.body.id_laboratorio,
            cantidad: req.body.cantidad,
            fecha_fab: req.body.fecha_fab,
            fecha_venc: req.body.fecha_venc,
            fecha_compra: req.body.fecha_compra
        });

        res.json({
            success: true,
            message: 'Lote actualizado exitosamente',
            data: lote
        });

    } catch (error) {
        console.error('Error detallado:', JSON.stringify(error, null, 2));
        // Manejo de errores de Sequelize
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
        res.sendStatus(204); // Respuesta exitosa sin contenido
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
        const { numLote, id_laboratorio, fecha_compra, fecha_venc, page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const where = {};
        if (numLote) where.num_lote = { [Op.like]: `${numLote}%` };
        if (id_laboratorio) where.id_laboratorio = id_laboratorio;
        if (fecha_compra) {
            const [anio, mes] = fecha_compra.split('-');
            const startOfMonth = new Date(anio, mes - 1, 1);
            const endOfMonth = new Date(anio, mes, 0);
            where.fecha_compra = { [Op.between]: [startOfMonth, endOfMonth] };
        }
        if (fecha_venc) {
            const [anio, mes] = fecha_venc.split('-');
            const startOfMonth = new Date(anio, mes - 1, 1);
            const endOfMonth = new Date(anio, mes, 0);
            where.fecha_venc = { [Op.between]: [startOfMonth, endOfMonth] };
        }

        const { count, rows } = await Lote.findAndCountAll({
            where,
            limit,
            offset,
            order: [['id', 'ASC']],
            include: [{
                model: Laboratorio,
                as: 'laboratorio',
                attributes: ['id', 'nombre']
            }]
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