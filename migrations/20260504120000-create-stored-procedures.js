'use strict';

module.exports = {
  async up(queryInterface) {
    // ── Reporte 1: Compras por laboratorio ───────────────────────────────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte1_compras_por_laboratorio`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte1_compras_por_laboratorio(IN p_desde DATE, IN p_hasta DATE)
      BEGIN
        SELECT
          lab.nombre        AS laboratorio,
          lab.nacionalidad,
          COUNT(l.id)       AS num_lotes,
          SUM(l.cantidad)   AS total_dosis,
          MIN(l.fecha_compra) AS primera_compra,
          MAX(l.fecha_compra) AS ultima_compra
        FROM lotes l
        JOIN laboratorios lab ON l.id_laboratorio = lab.id
        WHERE l.fecha_compra BETWEEN p_desde AND p_hasta
          AND l.deletedAt IS NULL
        GROUP BY lab.id, lab.nombre, lab.nacionalidad
        ORDER BY total_dosis DESC;
      END
    `);

    // ── Reporte 2: Lotes por tipo de vacuna ──────────────────────────────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte2_lotes_por_tipo()
      BEGIN
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
          (SELECT COUNT(*) FROM vacunas vv
           WHERE vv.tipo = v.tipo
             AND vv.id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)) AS vencidas
        FROM vacunas v
        LEFT JOIN stocks s  ON s.id_lote     = v.id_lote
        LEFT JOIN ubicaciones u ON s.id_ubicacion = u.id
        GROUP BY v.tipo
        ORDER BY v.tipo;
      END
    `);

    // ── Reporte 3: Stock por tipo de vacuna por provincia ────────────────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte3_stock_por_provincia`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte3_stock_por_provincia()
      BEGIN
        SELECT
          v.tipo          AS tipo_vacuna,
          p.nombre        AS provincia,
          u.tipo          AS tipo_ubicacion,
          SUM(s.cantidad) AS stock_disponible
        FROM stocks s
        JOIN lotes l      ON s.id_lote      = l.id
        JOIN vacunas v    ON v.id_lote       = l.id
        JOIN ubicaciones u ON s.id_ubicacion = u.id
        JOIN provincias p  ON u.id_provincia  = p.id
        WHERE u.tipo NOT IN ('Deposito Nacional', 'Distribucion')
          AND s.cantidad > 0
          AND l.deletedAt IS NULL
        GROUP BY v.tipo, p.id, p.nombre, u.tipo
        ORDER BY v.tipo, p.nombre, u.tipo;
      END
    `);

    // ── Reporte 4: Personas a las que se aplicó vacuna vencida ───────────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte4_vacunados_vencidas`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte4_vacunados_vencidas()
      BEGIN
        SELECT
          pac.nombre                                          AS nombre_paciente,
          pac.apellido                                        AS apellido_paciente,
          pac.dni,
          prov.nombre                                         AS provincia,
          u.nombre                                            AS centro,
          vac.tipo                                            AS tipo_vacuna,
          DATE_FORMAT(a.fecha_aplicacion, '%d/%m/%Y %H:%i')  AS fecha_aplicacion,
          DATE_FORMAT(l.fecha_venc, '%d/%m/%Y')               AS fecha_vencimiento_lote
        FROM aplicaciones a
        JOIN pacientes pac   ON a.id_paciente  = pac.id
        JOIN lotes l         ON a.id_lote      = l.id
        JOIN vacunas vac     ON a.id_vacuna    = vac.id
        JOIN ubicaciones u   ON a.id_ubicacion = u.id
        LEFT JOIN provincias prov ON u.id_provincia = prov.id
        WHERE DATE(a.fecha_aplicacion) > l.fecha_venc
          AND a.deletedAt IS NULL
        ORDER BY a.fecha_aplicacion DESC;
      END
    `);

    // ── Reporte 5: Vacunas vencidas no descartadas ───────────────────────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte5_vencidas_no_descartadas`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte5_vencidas_no_descartadas()
      BEGIN
        SELECT
          l.num_lote,
          vac.tipo                                AS tipo_vacuna,
          DATE_FORMAT(l.fecha_venc, '%d/%m/%Y')   AS fecha_vencimiento,
          p.nombre                                AS provincia,
          u.nombre                                AS ubicacion,
          u.tipo                                  AS tipo_ubicacion,
          s.cantidad                              AS stock_vencido
        FROM stocks s
        JOIN lotes l       ON s.id_lote      = l.id
        JOIN vacunas vac   ON vac.id_lote     = l.id
        JOIN ubicaciones u ON s.id_ubicacion  = u.id
        LEFT JOIN provincias p ON u.id_provincia = p.id
        WHERE l.fecha_venc < CURDATE()
          AND s.cantidad > 0
          AND l.deletedAt IS NULL
        ORDER BY l.fecha_venc ASC, p.nombre, u.nombre;
      END
    `);

    // ── Reporte 6: Personas vacunadas por tipo / provincia / localidad ────────
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte6_personas_vacunadas`);
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_reporte6_personas_vacunadas()
      BEGIN
        SELECT
          vac.tipo                                      AS tipo_vacuna,
          COALESCE(prov.nombre, 'Sin provincia')        AS provincia,
          COALESCE(pac.localidad, 'Sin localidad')      AS localidad,
          COUNT(a.id)                                   AS cantidad_vacunados
        FROM aplicaciones a
        JOIN pacientes pac ON a.id_paciente = pac.id
        JOIN lotes l       ON a.id_lote     = l.id
        JOIN vacunas vac   ON vac.id_lote   = l.id
        LEFT JOIN provincias prov ON pac.id_provincia = prov.id
        WHERE a.deletedAt IS NULL
        GROUP BY vac.tipo, prov.id, prov.nombre, pac.localidad
        ORDER BY vac.tipo, prov.nombre, pac.localidad;
      END
    `);

    // ── Evento MySQL: marca vencimientos automáticamente cada día ───────────
    await queryInterface.sequelize.query(`DROP EVENT IF EXISTS ev_marcar_vencimientos`);
    await queryInterface.sequelize.query(`
      CREATE EVENT IF NOT EXISTS ev_marcar_vencimientos
      ON SCHEDULE EVERY 1 DAY
      STARTS CURDATE()
      COMMENT 'Marca vacunas como vencidas automáticamente cada día'
      DO
        UPDATE vacunas
        SET id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)
        WHERE id_lote IN (
          SELECT id FROM lotes WHERE fecha_venc < CURDATE() AND deletedAt IS NULL
        )
        AND id_estado = (SELECT id FROM estados WHERE codigo = 'DISP' LIMIT 1)
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP EVENT     IF EXISTS ev_marcar_vencimientos`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte6_personas_vacunadas`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte5_vencidas_no_descartadas`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte4_vacunados_vencidas`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte3_stock_por_provincia`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte2_lotes_por_tipo`);
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_reporte1_compras_por_laboratorio`);
  }
};
