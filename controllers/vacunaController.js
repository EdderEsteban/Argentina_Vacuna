const { Vacuna, Lote, Laboratorio, Estado } = require('../models');
const { Op } = require('sequelize');

// Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

const vacunaController = {};

// Listar vacunas con paginación
vacunaController.listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows: vacunas } = await Vacuna.findAndCountAll({
            where: { deletedAt: null },
            include: [
                { 
                    model: Lote, 
                    as: 'lote',
                    include: [
                        { model: Laboratorio, as: 'laboratorio' }
                    ]
                },
                { model: Estado, as: 'estado' }
            ],
            order: [['id', 'ASC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        // Formatear fechas de los lotes
        const vacunasFormateadas = vacunas.map(vacuna => {
            if (vacuna.lote) {
                return {
                    ...vacuna.dataValues,
                    lote: {
                        ...vacuna.lote.dataValues,
                        fecha_fab: formatearFecha(vacuna.lote.fecha_fab),
                        fecha_venc: formatearFecha(vacuna.lote.fecha_venc),
                        fecha_compra: formatearFecha(vacuna.lote.fecha_compra)
                    }
                };
            }
            return vacuna.dataValues;
        });

        res.render('vacuna/listadoVacuna', {
            vacunas: vacunasFormateadas,
            pagination: {
                currentPage: page,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        });

    } catch (error) {
        console.error('Error al listar vacunas:', error);
        res.redirect('/404');
    }
};

// Mostrar formulario de creación de nueva vacuna
vacunaController.mostrarNuevo = async (req, res) => {
    try {
        // Obtener todos los lotes activos
        const lotes = await Lote.findAll({
            where: { deletedAt: null },
            include: [
                { model: Laboratorio, as: 'laboratorio' }
            ],
            order: [['id', 'ASC']]
        });

        // Obtener todos los estados activos
        const estados = await Estado.findAll({
            where: { deletedAt: null },
            order: [['id', 'ASC']]
        });

        res.render('vacuna/nuevaVacuna', {
            lotes,
            estados
        });
    } catch (error) {
        console.error('Error al cargar formulario de nueva vacuna:', error);
        res.redirect('/404');
    }
};

// POST Crear nueva vacuna
vacunaController.crearVacuna = async (req, res) => {
    try {
        const vacuna = await Vacuna.create({
            id_lote: req.body.id_lote,
            id_estado: req.body.id_estado,
            tipo: req.body.tipo.trim(),
            nombre_comercial: req.body.nombre_comercial.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Vacuna creada exitosamente',
            data: vacuna
        });

    } catch (error) {
        console.error('Error detallado:', JSON.stringify(error, null, 2));
        const errores = error.errors?.map(err => ({
            campo: err.path,
            mensaje: err.message
        })) || [{ mensaje: 'Error desconocido' }];

        res.status(400).json({
            success: false,
            message: 'Error al crear vacuna',
            errores
        });
    }
};

// Mostrar formulario de edición de vacuna
vacunaController.editarVacuna = async (req, res) => {
    try {
        const vacuna = await Vacuna.findByPk(req.params.id);

        if (!vacuna) {
            return res.redirect('vacunas');
        }

        // Obtener todos los lotes activos
        const lotes = await Lote.findAll({
            where: { deletedAt: null },
            include: [
                { model: Laboratorio, as: 'laboratorio' }
            ],
            order: [['id', 'ASC']]
        });

        // Obtener todos los estados activos
        const estados = await Estado.findAll({
            where: { deletedAt: null },
            order: [['id', 'ASC']]
        });

        res.render('vacuna/modificarVacuna', {
            vacuna,
            lotes,
            estados
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición de vacuna:', error);
        res.redirect('/404');
    }
};

// Actualizar vacuna
vacunaController.actualizarVacuna = async (req, res) => {
    try {
        const vacuna = await Vacuna.findByPk(req.params.id);

        if (!vacuna) {
            return res.status(404).json({
                success: false,
                message: 'Vacuna no encontrada'
            });
        }

        await vacuna.update({
            id_lote: req.body.id_lote,
            id_estado: req.body.id_estado,
            tipo: req.body.tipo.trim(),
            nombre_comercial: req.body.nombre_comercial.trim()
        });

        res.json({
            success: true,
            message: 'Vacuna actualizada exitosamente',
            data: vacuna
        });

    } catch (error) {
        const errores = error.errors?.map(err => ({
            campo: err.path,
            mensaje: err.message
        })) || [{ mensaje: 'Error desconocido' }];

        res.status(400).json({
            success: false,
            message: 'Error al actualizar vacuna',
            errores
        });
    }
};

// Eliminar vacuna (soft delete)
vacunaController.borrarVacuna = async (req, res) => {
    try {
        await Vacuna.destroy({
            where: { id: req.params.id }
        });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Formulario de búsqueda de vacunas
vacunaController.mostrarBuscar = (req, res) => {
    res.render('vacuna/buscarVacuna');
};

// Buscador de vacunas
vacunaController.buscarVacunas = async (req, res) => {
    try {
        const { tipo, nombre_comercial, id_lote, id_estado, page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const where = {};
        if (tipo) where.tipo = { [Op.like]: `${tipo}%` };
        if (nombre_comercial) where.nombre_comercial = { [Op.like]: `${nombre_comercial}%` };
        if (id_lote) where.id_lote = id_lote;
        if (id_estado) where.id_estado = id_estado;

        const { count, rows } = await Vacuna.findAndCountAll({
            where,
            limit,
            offset,
            order: [['id', 'ASC']],
            include: [
                { 
                    model: Lote, 
                    as: 'lote',
                    include: [
                        { model: Laboratorio, as: 'laboratorio' }
                    ]
                },
                { model: Estado, as: 'estado' }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        // Formatear fechas de los lotes
        const vacunasFormateadas = rows.map(vacuna => {
            if (vacuna.lote) {
                return {
                    ...vacuna.dataValues,
                    lote: {
                        ...vacuna.lote.dataValues,
                        fecha_fab: formatearFecha(vacuna.lote.fecha_fab),
                        fecha_venc: formatearFecha(vacuna.lote.fecha_venc),
                        fecha_compra: formatearFecha(vacuna.lote.fecha_compra)
                    }
                };
            }
            return vacuna.dataValues;
        });

        res.json({
            vacunas: vacunasFormateadas,
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

module.exports = vacunaController;