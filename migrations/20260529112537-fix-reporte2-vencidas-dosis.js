'use strict';

// El Reporte 2 listaba "vencidas" como COUNT de filas de la tabla vacunas
// (1 fila por lote) → contaba LOTES vencidos, no DOSIS. El resto de las columnas
// (en_nacion, en_centros, aplicadas, descartadas) están en dosis, así que la
// columna mezclaba unidades. El PDF pide "cuántas dosis se encuentran vencidas".
//
// Esta migration recrea sp_reporte2 para que "vencidas" sume las dosis en stock
// de lotes cuyo fecha_venc ya pasó (consistente con el Reporte 5 y con el resto
// de las columnas).

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte2_lotes_por_tipo(IN p_ubicacion_id INT)
      BEGIN
        IF p_ubicacion_id IS NULL THEN
          SELECT
            v.tipo,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
            COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
            (SELECT COUNT(*) FROM aplicaciones a
             JOIN vacunas av ON a.id_vacuna = av.id
             WHERE av.tipo = v.tipo AND a.deletedAt IS NULL) AS aplicadas,
            (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d
             JOIN lotes dl ON d.id_lote = dl.id
             JOIN vacunas dv ON dv.id_lote = dl.id
             WHERE dv.tipo = v.tipo AND d.deletedAt IS NULL) AS descartadas,
            (SELECT COALESCE(SUM(s2.cantidad), 0) FROM stocks s2
             JOIN lotes l2   ON s2.id_lote = l2.id
             JOIN vacunas v2 ON v2.id_lote = l2.id
             WHERE v2.tipo = v.tipo AND l2.fecha_venc < CURDATE() AND l2.deletedAt IS NULL) AS vencidas
          FROM vacunas v
          LEFT JOIN stocks s  ON s.id_lote     = v.id_lote
          LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
          GROUP BY v.tipo
          ORDER BY v.tipo;
        ELSE
          SELECT
            v.tipo,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
            COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
            (SELECT COUNT(*) FROM aplicaciones a
             JOIN vacunas av ON a.id_vacuna = av.id
             WHERE av.tipo = v.tipo AND a.deletedAt IS NULL AND a.id_ubicacion = p_ubicacion_id) AS aplicadas,
            (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d
             JOIN lotes dl ON d.id_lote = dl.id
             JOIN vacunas dv ON dv.id_lote = dl.id
             WHERE dv.tipo = v.tipo AND d.deletedAt IS NULL AND d.id_ubicacion = p_ubicacion_id) AS descartadas,
            (SELECT COALESCE(SUM(s2.cantidad), 0) FROM stocks s2
             JOIN lotes l2   ON s2.id_lote = l2.id
             JOIN vacunas v2 ON v2.id_lote = l2.id
             WHERE v2.tipo = v.tipo AND l2.fecha_venc < CURDATE() AND l2.deletedAt IS NULL
               AND s2.id_ubicacion = p_ubicacion_id) AS vencidas
          FROM vacunas v
          LEFT JOIN stocks s  ON s.id_lote     = v.id_lote AND s.id_ubicacion = p_ubicacion_id
          LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
          GROUP BY v.tipo
          ORDER BY v.tipo;
        END IF;
      END
    `);
  },

  async down(queryInterface) {
    // Revierte a la versión que contaba filas de vacuna (lotes) como vencidas
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte2_lotes_por_tipo(IN p_ubicacion_id INT)
      BEGIN
        IF p_ubicacion_id IS NULL THEN
          SELECT
            v.tipo,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
            COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
            (SELECT COUNT(*) FROM aplicaciones a JOIN vacunas av ON a.id_vacuna = av.id
             WHERE av.tipo = v.tipo AND a.deletedAt IS NULL) AS aplicadas,
            (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d
             JOIN lotes dl ON d.id_lote = dl.id JOIN vacunas dv ON dv.id_lote = dl.id
             WHERE dv.tipo = v.tipo AND d.deletedAt IS NULL) AS descartadas,
            (SELECT COUNT(*) FROM vacunas vv WHERE vv.tipo = v.tipo
             AND vv.id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)) AS vencidas
          FROM vacunas v
          LEFT JOIN stocks s ON s.id_lote = v.id_lote
          LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
          GROUP BY v.tipo ORDER BY v.tipo;
        ELSE
          SELECT
            v.tipo,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Nacional'   THEN s.cantidad ELSE 0 END), 0) AS en_nacion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Distribucion'        THEN s.cantidad ELSE 0 END), 0) AS en_distribucion,
            COALESCE(SUM(CASE WHEN u.tipo = 'Deposito Provincial' THEN s.cantidad ELSE 0 END), 0) AS en_provincia,
            COALESCE(SUM(CASE WHEN u.tipo = 'Centro Vacunacion'   THEN s.cantidad ELSE 0 END), 0) AS en_centros,
            (SELECT COUNT(*) FROM aplicaciones a JOIN vacunas av ON a.id_vacuna = av.id
             WHERE av.tipo = v.tipo AND a.deletedAt IS NULL AND a.id_ubicacion = p_ubicacion_id) AS aplicadas,
            (SELECT COALESCE(SUM(d.cantidad), 0) FROM descartes d
             JOIN lotes dl ON d.id_lote = dl.id JOIN vacunas dv ON dv.id_lote = dl.id
             WHERE dv.tipo = v.tipo AND d.deletedAt IS NULL AND d.id_ubicacion = p_ubicacion_id) AS descartadas,
            (SELECT COUNT(DISTINCT vv.id) FROM vacunas vv
             JOIN stocks ss ON ss.id_lote = vv.id_lote
             WHERE vv.tipo = v.tipo
               AND vv.id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)
               AND ss.id_ubicacion = p_ubicacion_id) AS vencidas
          FROM vacunas v
          LEFT JOIN stocks s ON s.id_lote = v.id_lote AND s.id_ubicacion = p_ubicacion_id
          LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
          GROUP BY v.tipo ORDER BY v.tipo;
        END IF;
      END
    `);
  }
};
