'use strict';

// Rehace los Stored Procedures de reportes para filtrar por nivel de ubicación
// con los parámetros p_ubicacion_id y p_provincia_id

const IN_PROV = (col) =>
  `(p_provincia_id IS NULL OR ${col} IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))`;

const SPS = [
`CREATE PROCEDURE sp_reporte1_compras_por_laboratorio(IN p_desde DATE, IN p_hasta DATE, IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  IF p_ubicacion_id IS NULL AND p_provincia_id IS NULL THEN
    SELECT lab.nombre AS laboratorio, lab.nacionalidad,
      COUNT(l.id) AS num_lotes, SUM(l.cantidad) AS total_dosis,
      DATE_FORMAT(MIN(l.fecha_compra), '%d/%m/%Y') AS primera_compra,
      DATE_FORMAT(MAX(l.fecha_compra), '%d/%m/%Y') AS ultima_compra
    FROM lotes l JOIN laboratorios lab ON l.id_laboratorio = lab.id
    WHERE l.fecha_compra BETWEEN p_desde AND p_hasta AND l.deletedAt IS NULL
    GROUP BY lab.id, lab.nombre, lab.nacionalidad
    ORDER BY total_dosis DESC;
  ELSE
    SELECT lab.nombre AS laboratorio, lab.nacionalidad,
      COUNT(DISTINCT l.id) AS num_lotes, SUM(ml.cantidad) AS total_dosis,
      DATE_FORMAT(MIN(l.fecha_compra), '%d/%m/%Y') AS primera_compra,
      DATE_FORMAT(MAX(l.fecha_compra), '%d/%m/%Y') AS ultima_compra
    FROM lotes l JOIN laboratorios lab ON l.id_laboratorio = lab.id
    JOIN movimientolotes ml ON ml.id_lote = l.id
    WHERE l.fecha_compra BETWEEN p_desde AND p_hasta AND l.deletedAt IS NULL AND ml.deletedAt IS NULL
      AND (p_ubicacion_id IS NULL OR ml.id_ubicacion_destino = p_ubicacion_id)
      AND ${IN_PROV('ml.id_ubicacion_destino')}
    GROUP BY lab.id, lab.nombre, lab.nacionalidad
    ORDER BY total_dosis DESC;
  END IF;
END`,

`CREATE PROCEDURE sp_reporte2_lotes_por_tipo(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  SELECT
    l.num_lote AS lote,
    lab.nombre AS laboratorio,
    (SELECT vv.tipo FROM vacunas vv WHERE vv.id_lote = l.id LIMIT 1) AS tipo_vacuna,
    DATE_FORMAT(l.fecha_venc, '%d/%m/%Y') AS fecha_vencimiento,
    (l.fecha_venc < CURDATE()) AS vencido,
    COALESCE((SELECT SUM(s.cantidad) FROM stocks s JOIN ubicaciones u ON s.id_ubicacion = u.id
              WHERE s.id_lote = l.id AND u.tipo = 'Deposito Nacional'), 0) AS en_nacion,
    COALESCE((SELECT SUM(ml.cantidad) FROM movimientolotes ml
              WHERE ml.id_lote = l.id AND ml.id_transporte IS NOT NULL AND ml.fecha_recepcion IS NULL AND ml.deletedAt IS NULL), 0) AS en_distribucion,
    COALESCE((SELECT SUM(s.cantidad) FROM stocks s JOIN ubicaciones u ON s.id_ubicacion = u.id
              WHERE s.id_lote = l.id AND u.tipo = 'Deposito Provincial'), 0) AS en_provincia,
    COALESCE((SELECT SUM(s.cantidad) FROM stocks s JOIN ubicaciones u ON s.id_ubicacion = u.id
              WHERE s.id_lote = l.id AND u.tipo = 'Centro Vacunacion'), 0) AS en_centros,
    COALESCE((SELECT SUM(s.cantidad) FROM stocks s WHERE s.id_lote = l.id
              AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('s.id_ubicacion')}), 0) AS en_ambito,
    (SELECT COUNT(*) FROM aplicaciones a WHERE a.id_lote = l.id AND a.deletedAt IS NULL
              AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('a.id_ubicacion')}) AS aplicadas,
    COALESCE((SELECT SUM(d.cantidad) FROM descartes d WHERE d.id_lote = l.id AND d.deletedAt IS NULL
              AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('d.id_ubicacion')}), 0) AS descartadas,
    CASE WHEN l.fecha_venc < CURDATE() THEN
      COALESCE((SELECT SUM(s.cantidad) FROM stocks s WHERE s.id_lote = l.id
              AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('s.id_ubicacion')}), 0)
    ELSE 0 END AS vencidas
  FROM lotes l JOIN laboratorios lab ON l.id_laboratorio = lab.id
  WHERE l.deletedAt IS NULL AND (
    (p_ubicacion_id IS NULL AND p_provincia_id IS NULL)
    OR EXISTS (SELECT 1 FROM stocks s WHERE s.id_lote = l.id
        AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('s.id_ubicacion')})
    OR EXISTS (SELECT 1 FROM aplicaciones a WHERE a.id_lote = l.id AND a.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('a.id_ubicacion')})
    OR EXISTS (SELECT 1 FROM descartes d WHERE d.id_lote = l.id AND d.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('d.id_ubicacion')})
  )
  ORDER BY tipo_vacuna, l.num_lote;
END`,

`CREATE PROCEDURE sp_reporte3_stock_por_provincia(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  IF p_ubicacion_id IS NOT NULL THEN
    SELECT v.tipo AS tipo_vacuna, p.nombre AS provincia, u.nombre AS ubicacion, u.tipo AS tipo_ubicacion,
      l.num_lote, DATE_FORMAT(l.fecha_venc, '%d/%m/%Y') AS fecha_vencimiento, s.cantidad AS stock_disponible
    FROM stocks s JOIN lotes l ON s.id_lote = l.id JOIN vacunas v ON v.id_lote = l.id
    JOIN ubicaciones u ON s.id_ubicacion = u.id LEFT JOIN provincias p ON u.id_provincia = p.id
    WHERE s.id_ubicacion = p_ubicacion_id AND s.cantidad > 0 AND l.deletedAt IS NULL
    ORDER BY v.tipo, l.fecha_venc;
  ELSE
    SELECT v.tipo AS tipo_vacuna, p.nombre AS provincia, u.tipo AS tipo_ubicacion, SUM(s.cantidad) AS stock_disponible
    FROM stocks s JOIN lotes l ON s.id_lote = l.id JOIN vacunas v ON v.id_lote = l.id
    JOIN ubicaciones u ON s.id_ubicacion = u.id JOIN provincias p ON u.id_provincia = p.id
    WHERE u.tipo NOT IN ('Deposito Nacional', 'Distribucion') AND s.cantidad > 0 AND l.deletedAt IS NULL
      AND (p_provincia_id IS NULL OR u.id_provincia = p_provincia_id)
    GROUP BY v.tipo, p.id, p.nombre, u.tipo
    ORDER BY v.tipo, p.nombre, u.tipo;
  END IF;
END`,

`CREATE PROCEDURE sp_reporte4_vacunados_vencidas(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  SELECT pac.nombre AS nombre_paciente, pac.apellido AS apellido_paciente, pac.dni,
    prov.nombre AS provincia, u.nombre AS centro, vac.tipo AS tipo_vacuna,
    DATE_FORMAT(a.fecha_aplicacion, '%d/%m/%Y %H:%i') AS fecha_aplicacion,
    DATE_FORMAT(l.fecha_venc, '%d/%m/%Y') AS fecha_vencimiento_lote
  FROM aplicaciones a
  JOIN pacientes pac ON a.id_paciente = pac.id
  JOIN lotes l ON a.id_lote = l.id
  JOIN vacunas vac ON a.id_vacuna = vac.id
  JOIN ubicaciones u ON a.id_ubicacion = u.id
  LEFT JOIN provincias prov ON u.id_provincia = prov.id
  WHERE DATE(a.fecha_aplicacion) > l.fecha_venc AND a.deletedAt IS NULL
    AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('a.id_ubicacion')}
  ORDER BY a.fecha_aplicacion DESC;
END`,

`CREATE PROCEDURE sp_reporte5_vencidas_no_descartadas(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  SELECT l.num_lote, vac.tipo AS tipo_vacuna, DATE_FORMAT(l.fecha_venc, '%d/%m/%Y') AS fecha_vencimiento,
    p.nombre AS provincia, u.nombre AS ubicacion, u.tipo AS tipo_ubicacion, s.cantidad AS stock_vencido
  FROM stocks s JOIN lotes l ON s.id_lote = l.id JOIN vacunas vac ON vac.id_lote = l.id
  JOIN ubicaciones u ON s.id_ubicacion = u.id LEFT JOIN provincias p ON u.id_provincia = p.id
  WHERE l.fecha_venc < CURDATE() AND s.cantidad > 0 AND l.deletedAt IS NULL
    AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND ${IN_PROV('s.id_ubicacion')}
  ORDER BY l.fecha_venc ASC, p.nombre, u.nombre;
END`,

`CREATE PROCEDURE sp_reporte6_personas_vacunadas(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  IF p_ubicacion_id IS NOT NULL THEN
    SELECT pac.apellido, pac.nombre, pac.dni, vac.tipo AS tipo_vacuna,
      COALESCE(prov.nombre, '—') AS provincia, COALESCE(pac.localidad, '—') AS localidad,
      DATE_FORMAT(a.fecha_aplicacion, '%d/%m/%Y') AS fecha_aplicacion
    FROM aplicaciones a JOIN pacientes pac ON a.id_paciente = pac.id
    JOIN vacunas vac ON a.id_vacuna = vac.id
    LEFT JOIN provincias prov ON pac.id_provincia = prov.id
    WHERE a.deletedAt IS NULL AND a.id_ubicacion = p_ubicacion_id
    ORDER BY a.fecha_aplicacion DESC;
  ELSE
    SELECT vac.tipo AS tipo_vacuna, COALESCE(prov.nombre, 'Sin provincia') AS provincia,
      COALESCE(pac.localidad, 'Sin localidad') AS localidad, COUNT(a.id) AS cantidad_vacunados
    FROM aplicaciones a JOIN pacientes pac ON a.id_paciente = pac.id
    JOIN vacunas vac ON a.id_vacuna = vac.id
    LEFT JOIN provincias prov ON pac.id_provincia = prov.id
    WHERE a.deletedAt IS NULL AND ${IN_PROV('a.id_ubicacion')}
    GROUP BY vac.tipo, prov.id, prov.nombre, pac.localidad
    ORDER BY vac.tipo, prov.nombre, pac.localidad;
  END IF;
END`,
];

const NOMBRES = [
  'sp_reporte1_compras_por_laboratorio',
  'sp_reporte2_lotes_por_tipo',
  'sp_reporte3_stock_por_provincia',
  'sp_reporte4_vacunados_vencidas',
  'sp_reporte5_vencidas_no_descartadas',
  'sp_reporte6_personas_vacunadas',
];

module.exports = {
  async up(queryInterface) {
    for (let i = 0; i < NOMBRES.length; i++) {
      await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${NOMBRES[i]}`);
      await queryInterface.sequelize.query(SPS[i]);
    }
  },
  async down(queryInterface) {
    for (const n of NOMBRES) {
      await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${n}`);
    }
  }
};
