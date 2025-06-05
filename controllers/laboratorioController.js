const { Laboratorio } = require('../models');
const { Op } = require('sequelize');

const labo = {}

// Listar laboratorios con paginación
labo.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Página actual (default: 1)
    const limit = 10; // Laboratorios por página
    const offset = (page - 1) * limit;

    const { count, rows: laboratorios } = await Laboratorio.findAndCountAll({
      where: { deletedAt: null },
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
    res.redirect('/404');
  }
};

// Mostrar formulario de creación
labo.mostrarNuevo = async (req, res) => {
    try {
        console.log('Cargando formulario de nuevo laboratorio');
        res.render('laboratorio/nuevoLaboratorio');
    } catch (error) {
        console.error('Error al cargar formulario de nuevo laboratorio:', error);
        res.redirect('/404');
    }
}

// Crear nuevo laboratorio
labo.crearLaboratorio = async (req, res) => {
    try {
        const laboratorio = await Laboratorio.create({
            nombre: req.body.nombre.trim(),
            nacionalidad: req.body.nacionalidad.trim()
        });

        // Respuesta para AJAX (Fetch)
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

// Mostrar formulario de edición
labo.editarLaboratorio = async (req, res) => {
    try {
        console.log('Cargando vista laboratorio con ID:', req.params.id);
        const laboratorio = await Laboratorio.findByPk(req.params.id);

        if (!laboratorio) {
            console.error('Laboratorio no encontrado con ID:', req.params.id);
            return res.redirect('laboratorio/listadoLaboratorio');
        }

        res.render('laboratorio/modificarLaboratorio', {
            laboratorio
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/404');
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

// Eliminar laboratorio (soft delete)
labo.borrarLaboratorio = async (req, res) => {
    try {
        await Laboratorio.destroy({
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

// Formulario de búsqueda
labo.mostrarBuscar = (req, res) => {
    res.render('laboratorio/buscarLaboratorio', {
    });
};

// Buscar laboratorio por nombre
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

