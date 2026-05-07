const { SolicitudesAcceso } = require('../models');

const solicitudes = {};

// Listar solicitudes de acceso con paginación, pendientes primero
solicitudes.listar = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await SolicitudesAcceso.findAndCountAll({
      order: [
        ['estado', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset,
      paranoid: false
    });

    res.render('solicitudes/listadoSolicitudes', {
      solicitudes: rows,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(count / limit),
        hasPreviousPage: page > 1,
        hasNextPage:     page < Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    res.redirect('/500');
  }
};

// Aprobar o rechazar una solicitud de acceso por su ID
solicitudes.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Aprobado', 'Rechazado'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    const sol = await SolicitudesAcceso.findByPk(id);
    if (!sol) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

    await sol.update({ estado });
    res.json({ success: true, message: `Solicitud ${estado.toLowerCase()} correctamente` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
};

module.exports = solicitudes;
