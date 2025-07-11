const { Ubicacion, Provincia } = require('../models');
const { Op } = require('sequelize');

const ubicacion = {};

// Listar ubicaciones con paginación
ubicacion.listar = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Ubicacion.findAndCountAll({
      where: { deletedAt: null },
      include: [
        { model: Provincia, as: 'provincia' }
      ],
      order: [['id', 'ASC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.render('ubicacion/listadoUbicacion', {
      ubicaciones: rows,
      pagination: {
        currentPage: page,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      }
    });

  } catch (error) {
    console.error('Error al listar ubicaciones:', error);
    res.redirect('/404');
  }
};

// Mostrar formulario de nueva ubicación
ubicacion.mostrarNuevo = async (req, res) => {
  try {
    const provincias = await Provincia.findAll({
      where: { deletedAt: null },
      order: [['nombre', 'ASC']]
    });

    res.render('ubicacion/nuevoUbicacion', {
      provincias
    });

  } catch (error) {
    console.error('Error al cargar formulario de nueva ubicación:', error);
    res.redirect('/404');
  }
};

// Crear nueva ubicación
ubicacion.crearUbicacion = async (req, res) => {
  try {
    const { nombre, direccion, telefono, id_provincia, tipo } = req.body;

    // Validar que el tipo sea válido
    const tiposValidos = ['Deposito Nacional', 'Distribucion', 'Deposito Provincial', 'Centro Vacunacion'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de ubicación no válido',
        errores: [{ campo: 'tipo', mensaje: 'Debe seleccionar un tipo de ubicación válido' }]
      });
    }

    // Validar que la provincia exista
    const provincia = await Provincia.findByPk(id_provincia);
    if (!provincia) {
      return res.status(400).json({
        success: false,
        message: 'Provincia no encontrada',
        errores: [{ campo: 'id_provincia', mensaje: 'La provincia seleccionada no existe' }]
      });
    }

    const nuevaUbicacion = await Ubicacion.create({
      nombre,
      direccion,
      telefono,
      tipo,
      id_provincia
    });

    res.status(201).json({
      success: true,
      message: 'Ubicación creada exitosamente',
      data: nuevaUbicacion
    });

  } catch (error) {
    console.error('Error al crear ubicación:', error);
    const errores = error.errors?.map(err => ({
      campo: err.path,
      mensaje: err.message
    })) || [{ mensaje: 'Error desconocido' }];

    res.status(400).json({
      success: false,
      message: 'Error al crear ubicación',
      errores
    });
  }
};

// Mostrar formulario de edición de ubicación
ubicacion.editarUbicacion = async (req, res) => {
  try {
    const ubicacionId = req.params.id;
    const ubicacion = await Ubicacion.findByPk(ubicacionId, {
      include: [
        { model: Provincia, as: 'provincia' }
      ]
    });

    if (!ubicacion) {
      return res.status(404).render('error404');
    }

    const provincias = await Provincia.findAll({
      where: { deletedAt: null },
      order: [['nombre', 'ASC']]
    });

    res.render('ubicacion/modificarUbicacion', {
      ubicacion,
      provincias
    });

  } catch (error) {
    console.error('Error al cargar formulario de edición de ubicación:', error);
    res.redirect('/404');
  }
};

// Actualizar ubicación
ubicacion.actualizarUbicacion = async (req, res) => {
  try {
    const ubicacionId = req.params.id;
    const ubicacion = await Ubicacion.findByPk(ubicacionId);

    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }

    const { nombre, direccion, telefono, id_provincia, tipo } = req.body;

    // Validar que el tipo sea válido
    const tiposValidos = ['Deposito Nacional', 'Distribucion', 'Deposito Provincial', 'Centro Vacunacion'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de ubicación no válido',
        errores: [{ campo: 'tipo', mensaje: 'Debe seleccionar un tipo de ubicación válido' }]
      });
    }

    // Validar que la provincia exista
    const provincia = await Provincia.findByPk(id_provincia);
    if (!provincia) {
      return res.status(400).json({
        success: false,
        message: 'Provincia no encontrada',
        errores: [{ campo: 'id_provincia', mensaje: 'La provincia seleccionada no existe' }]
      });
    }

    await ubicacion.update({
      nombre,
      direccion,
      telefono,
      tipo,
      id_provincia
    });

    res.json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      data: ubicacion
    });

  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    const errores = error.errors?.map(err => ({
      campo: err.path,
      mensaje: err.message
    })) || [{ mensaje: 'Error desconocido' }];

    res.status(400).json({
      success: false,
      message: 'Error al actualizar ubicación',
      errores
    });
  }
};

// Eliminar ubicación (soft delete)
ubicacion.borrarUbicacion = async (req, res) => {
  try {
    await Ubicacion.destroy({
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

// Mostrar formulario de búsqueda de ubicaciones
ubicacion.mostrarBuscar = async (req, res) => {
  try {
    // Obtener todas las ubicaciones
    const ubicaciones = await Ubicacion.findAll({
      where: { deletedAt: null },
      include: [
        { model: Provincia, as: 'provincia' }
      ],
      order: [['nombre', 'ASC']]
    });

    // Obtener todas las provincias para el select
    const provincias = await Provincia.findAll({
      where: { deletedAt: null },
      order: [['nombre', 'ASC']]
    });

    res.render('ubicacion/buscarUbicacion', { 
      ubicaciones,
      provincias
    });
  } catch (error) {
    console.error('Error al cargar formulario de búsqueda de ubicaciones:', error);
    res.redirect('/404');
  }
};

// Buscador de ubicaciones
ubicacion.buscarUbicacion = async (req, res) => {
  try {
    const { nombre, direccion, telefono, id_provincia, tipo, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (telefono) where.telefono = { [Op.like]: `${telefono}%` };
    if (id_provincia) where.id_provincia = id_provincia;
    if (tipo) where.tipo = tipo;

    const { count, rows } = await Ubicacion.findAndCountAll({
      where,
      include: [
        { model: Provincia, as: 'provincia' }
      ],
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    // Obtener todas las provincias activas
    const provincias = await Provincia.findAll({
      where: { deletedAt: null },
      order: [['nombre', 'ASC']]
    });

    res.json({
      ubicaciones: rows,
      provincias,
      pagination: {
        totalItems: count,
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al buscar ubicaciones:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: error.message
    });
  }
};

module.exports = ubicacion;



