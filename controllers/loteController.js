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

// Mostrar formulario de creación
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



module.exports = lote;