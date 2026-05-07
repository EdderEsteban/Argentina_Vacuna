const { SolicitudesAcceso, Usuario, Rol, Ubicacion, UsuarioUbicacion } = require('../models');

const solicitudes = {};

// Listar solicitudes con paginación — pendientes primero; pasa ubicaciones y roles para el modal de aprobación
solicitudes.listar = async (req, res) => {
  try {
    const page   = parseInt(req.query.page) || 1;
    const limit  = 10;
    const offset = (page - 1) * limit;

    const [{ count, rows }, ubicaciones, roles] = await Promise.all([
      SolicitudesAcceso.findAndCountAll({
        order: [['estado', 'ASC'], ['createdAt', 'DESC']],
        limit,
        offset,
        paranoid: false
      }),
      Ubicacion.findAll({ where: { deletedAt: null }, order: [['nombre', 'ASC']] }),
      Rol.findAll({ order: [['nombre', 'ASC']] })
    ]);

    res.render('solicitudes/listadoSolicitudes', {
      solicitudes: rows,
      ubicaciones,
      roles,
      pagination: {
        currentPage:     page,
        totalPages:      Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage:     page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    res.redirect('/500');
  }
};

// Aprobar (crea usuario + asigna ubicación/rol) o rechazar una solicitud
solicitudes.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, id_ubicacion, id_rol } = req.body;

    if (!['Aprobado', 'Rechazado'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido.' });
    }

    const sol = await SolicitudesAcceso.findByPk(id);
    if (!sol) return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });

    if (estado === 'Aprobado') {
      if (!id_ubicacion || !id_rol) {
        return res.status(400).json({ success: false, message: 'Seleccioná una ubicación y un rol para crear el usuario.' });
      }
      if (!sol.usuario || !sol.password) {
        return res.status(400).json({ success: false, message: 'Esta solicitud no tiene credenciales registradas y no puede aprobarse.' });
      }

      const user = await Usuario.create({
        nombre:   sol.nombre,
        apellido: sol.apellido,
        dni:      sol.dni,
        correo:   sol.correo,
        telefono: sol.telefono || '',
        usuario:  sol.usuario,
        password: sol.password
      });

      await UsuarioUbicacion.create({ id_usuario: user.id, id_ubicacion, id_rol });
      await sol.update({ estado: 'Aprobado' });

      return res.json({
        success: true,
        message: 'Solicitud aprobada. El usuario fue creado correctamente.',
        usuario: { id: user.id, usuario: user.usuario, nombre: `${user.nombre} ${user.apellido}` }
      });
    }

    await sol.update({ estado: 'Rechazado' });
    res.json({ success: true, message: 'Solicitud rechazada correctamente.' });

  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const campo = Object.keys(err.fields)[0];
      return res.status(409).json({ success: false, message: `El campo "${campo}" ya está registrado en el sistema.` });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al procesar la solicitud.' });
  }
};

module.exports = solicitudes;
