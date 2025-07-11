const { Paciente, Provincia, Ubicacion, Aplicacion, Vacuna, Lote, Usuario } = require('../models');
const { Op } = require('sequelize');

const paciente = {};

// Función para formatear fechas
function formatearFecha(fecha) {
    // Convertir a cadena si es un objeto de fecha
    if (fecha instanceof Date) {
        fecha = fecha.toISOString().split('T')[0]; 
    }

    if (typeof fecha !== 'string') {
        return ''; 
    }

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

// Listar pacientes con paginación
paciente.listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Paciente.findAndCountAll({
            where: { deletedAt: null },
            limit,
            offset,
            order: [['id', 'ASC']],
            include: [
                {
                    model: Provincia,
                    as: 'provincia',
                    attributes: ['id', 'nombre']
                },
                {
                    model: Ubicacion,
                    as: 'ubicacionRegistro',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        res.render('paciente/listadoPaciente', {
            pacientes: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                hasPreviousPage: page > 1,
                hasNextPage: page < Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error al listar pacientes:', error);
        res.redirect('/500');
    }
};

// Mostrar formulario de nuevo paciente
paciente.mostrarNuevo = async (req, res) => {
    try {
        console.log('Cargando formulario de nuevo paciente');
        const provincias = await Provincia.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });
        const ubicaciones = await Ubicacion.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });

        res.render('paciente/nuevoPaciente', {
            provincias,
            ubicaciones
        });

    } catch (error) {
        console.log('Error al cargar formulario de nuevo paciente:', error);
        res.redirect('/500');
    }
};

// Crear nuevo paciente
paciente.crearPaciente = async (req, res) => {
    try {
        // Validar que el paciente no se repita
        const pacienteExistente = await Paciente.findOne({
            where: { dni: req.body.dni.trim() }
        });

        if (pacienteExistente) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear paciente',
                errores: [{
                    campo: 'Dni',
                    mensaje: 'El DNI ya existe.'
                }]
            });
        }
        const nuevoPaciente = await Paciente.create({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            dni: req.body.dni,
            telefono: req.body.telefono,
            correo: req.body.correo,
            id_provincia: req.body.id_provincia,
            id_ubicacion_registro: req.body.id_ubicacion_registro
        });

        res.status(201).json({
            success: true,
            message: 'Paciente creado exitosamente',
            data: nuevoPaciente
        });

    } catch (error) {
        console.error('Error detallado:', error); // Imprime el error completo
        let errores = [];

        // Manejo de errores de Sequelize
        if (error.errors && Array.isArray(error.errors)) {
            errores = error.errors.map(err => ({
                campo: err.path,
                mensaje: err.message
            }));
        } else if (error.message) {
            // Manejo de otros errores con mensaje
            errores = [{
                mensaje: error.message
            }];
        } else {
            // Manejo de errores genéricos
            errores = [{
                mensaje: 'Error desconocido al crear el paciente. Por favor, inténtelo de nuevo más tarde.'
            }];
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear un paciente',
            errores
        });
    }
};

// Mostrar formulario de edición de paciente
paciente.editarPaciente = async (req, res) => {
    try {
        const paciente = await Paciente.findByPk(req.params.id, {
            include: [
                { model: Provincia, as: 'provincia' },
                { model: Ubicacion, as: 'ubicacionRegistro' }
            ]
        });

        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        const provincias = await Provincia.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });
        const ubicaciones = await Ubicacion.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });

        res.render('paciente/modificarPaciente', {
            paciente,
            provincias,
            ubicaciones
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/500');
    }
};

// Actualizar paciente
paciente.actualizarPaciente = async (req, res) => {
    try {
        const paciente = await Paciente.findByPk(req.params.id);

        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        await paciente.update({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            dni: req.body.dni,
            telefono: req.body.telefono,
            correo: req.body.correo,
            id_provincia: req.body.id_provincia,
            id_ubicacion_registro: req.body.id_ubicacion_registro
        });

        res.redirect('/pacientes');

    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        res.redirect('/500');
    }
};

// Borrar paciente (soft delete)
paciente.borrarPaciente = async (req, res) => {
    console.log('Borrando paciente con ID:', req.params.id);
    try {
        await Paciente.destroy({
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

// Formulario vista de búsqueda de pacientes
paciente.mostrarBuscar = async (req, res) => {
    try {
        const provincias = await Provincia.findAll({
            where: { deletedAt: null },
            order: [['nombre', 'ASC']]
        });
        const ubicaciones = await Ubicacion.findAll({
            where: { deletedAt: null, tipo: 'Centro Vacunacion' },
            order: [['nombre', 'ASC']]
        });

        res.render('paciente/buscarPaciente', {
            provincias,
            ubicaciones
        });

    } catch (error) {
        console.error('Error al cargar formulario de búsqueda:', error);
        res.redirect('/500');
    }
};

// Buscador de pacientes
paciente.buscarPacientes = async (req, res) => {
    try {
        const { dni, nombre, apellido, id_provincia, id_ubicacion_registro, page = 1 } = req.query;
        const limit = 10;
        const offset = (page - 1) * limit;

        const wherePaciente = {};
        if (dni) wherePaciente.dni = { [Op.like]: `${dni}%` };
        if (nombre) wherePaciente.nombre = { [Op.like]: `${nombre}%` };
        if (apellido) wherePaciente.apellido = { [Op.like]: `${apellido}%` };
        if (id_provincia) wherePaciente.id_provincia = id_provincia;
        if (id_ubicacion_registro) wherePaciente.id_ubicacion_registro = id_ubicacion_registro;

        const { count, rows } = await Paciente.findAndCountAll({
            where: wherePaciente,
            limit,
            offset,
            order: [['id', 'ASC']],
            include: [
                { model: Provincia, as: 'provincia' },
                { model: Ubicacion, as: 'ubicacionRegistro' }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            pacientes: rows,
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
        res.redirect('/500');
    }
};

// Mostrar detalles del paciente y sus vacunas
paciente.detallePaciente = async (req, res) => {
  try {
    console.log('Mostrando detalles del paciente con ID:', req.params.id);
    const pacienteId = req.params.id;
    const paciente = await Paciente.findByPk(pacienteId, {
      include: [
        { model: Provincia, as: 'provincia' },
        { model: Ubicacion, as: 'ubicacionRegistro' }
      ]
    });

    if (!paciente) {
      return res.status(404).render('error404');
    }

    const aplicaciones = await Aplicacion.findAll({
      where: { id_paciente: pacienteId },
      include: [
        {
          model: Vacuna,
          as: 'vacuna',
          include: [
            {
              model: Lote,
              as: 'lote'
            }
          ]
        },
        {
          model: Ubicacion,
          as: 'ubicacion'
        },
        {
          model: Usuario,
          as: 'usuario'
        }
      ]
    });

    // Preparar datos de vacunas para la vista
    const vacunas = aplicaciones.map(aplicacion => ({
      lote: aplicacion.vacuna.lote.num_lote,
      tipo: aplicacion.vacuna.tipo,
      fecha_aplicacion: formatearFecha(aplicacion.fecha_aplicacion), 
      ubicacion: aplicacion.ubicacion.nombre,
      usuario: {
        nombre: aplicacion.usuario.nombre,
        apellido: aplicacion.usuario.apellido
      }
    }));

    res.render('paciente/detallePaciente', {
      paciente,
      vacunas
    });

  } catch (error) {
    console.error('Error al obtener detalles del paciente:', error);
    res.redirect('/500');
  }
};

module.exports = paciente;