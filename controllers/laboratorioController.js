const { Laboratorio, Lote, sequelize } = require('../models');
const { Op } = require('sequelize');
const { idsEnScope } = require('../modules/permisos');

const labo = {}

// Listar laboratorios con paginación
labo.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Página actual (default: 1)
    const limit = 10; // Laboratorios por página
    const offset = (page - 1) * limit;

    // Fuera del nivel nacional, solo laboratorios con lotes en el ámbito del usuario
    const where = { deletedAt: null };
    const scopeIds = await idsEnScope(req.session.usuario);
    if (scopeIds !== null) {
      const idsList = scopeIds.length ? scopeIds.join(',') : 'NULL';
      where.id = { [Op.in]: sequelize.literal(`(SELECT DISTINCT id_laboratorio FROM lotes WHERE deletedAt IS NULL AND id IN (SELECT id_lote FROM stocks WHERE id_ubicacion IN (${idsList})))`) };
    }

    const { count, rows: laboratorios } = await Laboratorio.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.render('laboratorio/listadoLaboratorio', {
      laboratorios,
      pagination: {
        currentPage: page,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      }
    });

  } catch (error) {
    console.error('Error al listar laboratorios:', error);
    res.redirect('/500');
  }
};

// Mostrar formulario de creación de nuevo laboratorio
labo.mostrarNuevo = async (req, res) => {
    try {
        console.log('Cargando formulario de nuevo laboratorio');
        res.render('laboratorio/nuevoLaboratorio');
    } catch (error) {
        console.error('Error al cargar formulario de nuevo laboratorio:', error);
        res.redirect('/500');
    }
}

// POST Crear nuevo laboratorio
labo.crearLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.create({
            nombre: req.body.nombre.trim(),
            nacionalidad: req.body.nacionalidad.trim()
        });
        
        res.status(201).json({
            success: true,
            message: 'Laboratorio creado exitosamente',
            data: laboratorio
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
            message: 'Error al crear laboratorio',
            errores
        });
    }
};

// Mostrar formulario de edición de laboratorio
labo.editarLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.findByPk(req.params.id);

        if (!laboratorio) {
            return res.redirect('/laboratorios');
        }

        res.render('laboratorio/modificarLaboratorio', {
            laboratorio
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/500');
    }
}

// Actualizar laboratorio
labo.actualizarLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.findByPk(req.params.id);

        if (!laboratorio) {
            return res.status(404).json({
                success: false,
                message: 'Laboratorio no encontrado'
            });
        }

        await laboratorio.update({
            nombre: req.body.nombre.trim(),
            nacionalidad: req.body.nacionalidad.trim()
        });

        res.json({
            success: true,
            message: 'Laboratorio actualizado exitosamente',
            data: laboratorio
        });

    } catch (error) {
        const errores = error.errors?.map(err => ({
            campo: err.path,
            mensaje: err.message
        })) || [{ mensaje: 'Error desconocido' }];

        res.status(400).json({
            success: false,
            message: 'Error al actualizar laboratorio',
            errores
        });
    }
};

// Eliminar laboratorio (soft delete). Bloquea si hay lotes activos del laboratorio
// para no dejar lotes huérfanos referenciando un laboratorio inexistente.
labo.borrarLaboratorio = async (req, res) => {
    try {
        const lotesActivos = await Lote.count({ where: { id_laboratorio: req.params.id, deletedAt: null } });
        if (lotesActivos > 0) {
            return res.status(409).json({
                success: false,
                message: `No se puede eliminar: hay ${lotesActivos} lote(s) activos de este laboratorio.`
            });
        }
        await Laboratorio.destroy({ where: { id: req.params.id } });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Formulario de búsqueda
labo.mostrarBuscar = (req, res) => {
    res.render('laboratorio/buscarLaboratorio', {
    });
};

// Buscador laboratorio 
labo.buscarLaboratorio = async (req, res) => {
  try {
    const { nombre, nacionalidad, page = 1 } = req.query;
    const limit = 10; // Aca se ajusta el numero de resultados por página
    const offset = (page - 1) * limit; 

    const where = {};
    if (nombre) where.nombre = { [Op.like]: `${nombre}%` };
    if (nacionalidad) where.nacionalidad = { [Op.like]: `${nacionalidad}%` };

    const { count, rows } = await Laboratorio.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      laboratorios: rows,
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


module.exports = labo;

