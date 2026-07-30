const { sequelize } = require('../models');
const { alcanceDatos } = require('../modules/permisos');

const reporte = {};

// Normaliza el resultado de CALL según el driver/BD
function extractRows(raw) {
  if (!Array.isArray(raw[0])) return raw;
  if (Array.isArray(raw[0][0])) return raw[0][0];
  return raw[0].filter(r => r && typeof r === 'object' && !('affectedRows' in r));
}

// Función para obtener los parámetros de alcance que reciben los procedimientos
function getAlcance(req) {
  const usuario = req.session.usuario;
  const a = alcanceDatos(usuario);
  return {
    nivel: a.nivel,
    esNacional: a.global,
    esProvincial: a.nivel === 'provincial',
    esCentro: a.nivel === 'centro',
    p_ubicacion: a.idUbicacion,                        // sólo centro
    p_provincia: a.idUbicacion ? null : a.idProvincia, // sólo provincia
    ubicacionActual: usuario.ubicacionActual || null,
  };
}

// Ruta para el índice de reportes
reporte.index = (req, res) => {
  const alcance = getAlcance(req);
  res.render('reportes/index', {
    alcance,
    mostrarReporte1: !alcance.esCentro,
    mostrarReporte3: true,
  });
};

// Reporte 1: Compras por laboratorio
reporte.reporte1 = async (req, res) => {
  const alcance = getAlcance(req);
  if (alcance.esCentro) {
    return res.status(403).render('error403', { usuario: req.session.usuario });
  }
  const { fecha_desde, fecha_hasta } = req.query;
  let resultados = null;

  if (fecha_desde && fecha_hasta) {
    try {
      const raw = await sequelize.query(
        'CALL sp_reporte1_compras_por_laboratorio(:desde, :hasta, :ubic, :prov)',
        { replacements: { desde: fecha_desde, hasta: fecha_hasta, ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
      );
      resultados = extractRows(raw);
    } catch (error) {
      console.error('Error reporte 1:', error.message);
      resultados = [];
    }
  }

  res.render('reportes/reporte1', {
    resultados,
    fecha_desde: fecha_desde || '',
    fecha_hasta: fecha_hasta || '',
    alcance,
  });
};

// Reporte 2: Trazabilidad por lote-proveedor
reporte.reporte2 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte2_lotes_por_tipo(:ubic, :prov)',
      { replacements: { ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
    );
    res.render('reportes/reporte2', { resultados: extractRows(raw), alcance });
  } catch (error) {
    console.error('Error reporte 2:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 3: Stock por provincia o vacunatorio
reporte.reporte3 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte3_stock_por_provincia(:ubic, :prov)',
      { replacements: { ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
    );
    res.render('reportes/reporte3', {
      resultados: extractRows(raw),
      alcance,
      tituloScope: alcance.esCentro ? 'Stock en Vacunatorio' : 'Stock por Provincia',
    });
  } catch (error) {
    console.error('Error reporte 3:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 4: Personas a las que se aplicó vacuna vencida
reporte.reporte4 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte4_vacunados_vencidas(:ubic, :prov)',
      { replacements: { ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
    );
    res.render('reportes/reporte4', { resultados: extractRows(raw), alcance });
  } catch (error) {
    console.error('Error reporte 4:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 5: Vacunas vencidas no descartadas
reporte.reporte5 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte5_vencidas_no_descartadas(:ubic, :prov)',
      { replacements: { ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
    );
    res.render('reportes/reporte5', { resultados: extractRows(raw), alcance });
  } catch (error) {
    console.error('Error reporte 5:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 6: Personas vacunadas
reporte.reporte6 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte6_personas_vacunadas(:ubic, :prov)',
      { replacements: { ubic: alcance.p_ubicacion, prov: alcance.p_provincia } }
    );
    res.render('reportes/reporte6', { resultados: extractRows(raw), alcance });
  } catch (error) {
    console.error('Error reporte 6:', error.message);
    res.status(500).render('error500');
  }
};

module.exports = reporte;
