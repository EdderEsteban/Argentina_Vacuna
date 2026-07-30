'use strict';

// Rehace sp_reporte2_lotes_por_tipo para devolver una fila por lote-proveedor
// con los 7 estados discriminados

const CREATE_SP = `
CREATE PROCEDURE sp_reporte2_lotes_por_tipo(IN p_ubicacion_id INT)
BEGIN
  SELECT
    l.num_lote                                AS lote,
    lab.nombre                                AS laboratorio,
    (SELECT vv.tipo FROM vacunas vv WHERE vv.id_lote = l.id LIMIT 1) AS tipo_vacuna,
    DATE_FORMAT(l.fecha_venc, '%d/%m/%Y')     AS fecha_vencimiento,
    COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
    COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
    COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
    COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
    (SELECT COUNT(*) FROM aplicaciones a
      WHERE a.id_lote = l.id AND a.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id)) AS aplicadas,
    (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d
      WHERE d.id_lote = l.id AND d.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id)) AS descartadas,
    CASE WHEN l.fecha_venc < CURDATE()
         THEN COALESCE(SUM(s.cantidad), 0) ELSE 0 END AS vencidas
  FROM lotes l
  JOIN laboratorios lab ON l.id_laboratorio = lab.id
  LEFT JOIN stocks s
    ON s.id_lote = l.id
   AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id)
  LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
  WHERE l.deletedAt IS NULL
  GROUP BY l.id, l.num_lote, lab.nombre, l.fecha_venc
  ORDER BY tipo_vacuna, l.num_lote;
END
`;

// Cuerpo anterior del procedimiento, para el down()
const CREATE_SP_OLD = `
CREATE PROCEDURE sp_reporte2_lotes_por_tipo(IN p_ubicacion_id INT)
BEGIN
  SELECT
    v.tipo,
    COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
    COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
    COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
    COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
    (SELECT COUNT(*) FROM aplicaciones a JOIN vacunas av ON a.id_vacuna = av.id
      WHERE av.tipo = v.tipo AND a.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id)) AS aplicadas,
    (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d JOIN lotes dl ON d.id_lote = dl.id
       JOIN vacunas dv ON dv.id_lote = dl.id
      WHERE dv.tipo = v.tipo AND d.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id)) AS descartadas,
    (SELECT COALESCE(SUM(s2.cantidad), 0) FROM stocks s2 JOIN lotes l2 ON s2.id_lote = l2.id
       JOIN vacunas v2 ON v2.id_lote = l2.id
      WHERE v2.tipo = v.tipo AND l2.fecha_venc < CURDATE() AND l2.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR s2.id_ubicacion = p_ubicacion_id)) AS vencidas
  FROM vacunas v
  LEFT JOIN stocks s ON s.id_lote = v.id_lote AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id)
  LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
  GROUP BY v.tipo
  ORDER BY v.tipo;
END
`;

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo');
    await queryInterface.sequelize.query(CREATE_SP);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo');
    await queryInterface.sequelize.query(CREATE_SP_OLD);
  }
};
