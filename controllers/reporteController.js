const { sequelize } = require('../models');

const reporte = {};

// Normaliza el resultado de CALL según el driver/BD:
//   MariaDB + mysql2 v3 + Sequelize 6: raw = [row1, row2, ...]  (plano)
//   MySQL tradicional:                 raw = [[[row1,...], OkPacket], fields]
function extractRows(raw) {
  if (!Array.isArray(raw[0])) {
    // MariaDB: raw[0] es un objeto fila => raw ya es el array de filas
    return raw;
  }
  if (Array.isArray(raw[0][0])) {
    // MySQL anidado: raw[0][0] es el array de filas
    return raw[0][0];
  }
  // Variante intermedia: raw[0] = [rows..., OkPacket]
  return raw[0].filter(r => r && typeof r === 'object' && !('affectedRows' in r));
}

reporte.index = (req, res) => {
  res.render('reportes/index');
};

// Reporte 1: Compras por laboratorio (filtro: rango de fecha_compra)
reporte.reporte1 = async (req, res) => {
  const { fecha_desde, fecha_hasta } = req.query;
  let resultados = null;

  if (fecha_desde && fecha_hasta) {
    try {
      const raw = await sequelize.query(
        'CALL sp_reporte1_compras_por_laboratorio(:desde, :hasta)',
        { replacements: { desde: fecha_desde, hasta: fecha_hasta } }
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
    fecha_hasta: fecha_hasta || ''
  });
};

// Reporte 2: Lotes por tipo de vacuna con dosis por estado
reporte.reporte2 = async (req, res) => {
  try {
    const raw = await sequelize.query('CALL sp_reporte2_lotes_por_tipo()');
    res.render('reportes/reporte2', { resultados: extractRows(raw) });
  } catch (error) {
    console.error('Error reporte 2:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 3: Stock disponible por tipo de vacuna por provincia
reporte.reporte3 = async (req, res) => {
  try {
    const raw = await sequelize.query('CALL sp_reporte3_stock_por_provincia()');
    res.render('reportes/reporte3', { resultados: extractRows(raw) });
  } catch (error) {
    console.error('Error reporte 3:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 4: Personas a las que se aplicó vacuna vencida
reporte.reporte4 = async (req, res) => {
  try {
    const raw = await sequelize.query('CALL sp_reporte4_vacunados_vencidas()');
    res.render('reportes/reporte4', { resultados: extractRows(raw) });
  } catch (error) {
    console.error('Error reporte 4:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 5: Vacunas vencidas no descartadas
reporte.reporte5 = async (req, res) => {
  try {
    const raw = await sequelize.query('CALL sp_reporte5_vencidas_no_descartadas()');
    res.render('reportes/reporte5', { resultados: extractRows(raw) });
  } catch (error) {
    console.error('Error reporte 5:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 6: Personas vacunadas por tipo de vacuna / provincia / localidad
reporte.reporte6 = async (req, res) => {
  try {
    const raw = await sequelize.query('CALL sp_reporte6_personas_vacunadas()');
    res.render('reportes/reporte6', { resultados: extractRows(raw) });
  } catch (error) {
    console.error('Error reporte 6:', error.message);
    res.status(500).render('error500');
  }
};

module.exports = reporte;
