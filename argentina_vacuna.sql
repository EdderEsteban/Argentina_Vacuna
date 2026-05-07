-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-05-2026 a las 16:39:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `argentina_vacuna`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte1_compras_por_laboratorio` (IN `p_desde` DATE, IN `p_hasta` DATE)   BEGIN
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
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte2_lotes_por_tipo` ()   BEGIN
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
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte3_stock_por_provincia` ()   BEGIN
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
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte4_vacunados_vencidas` ()   BEGIN
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
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte5_vencidas_no_descartadas` ()   BEGIN
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
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte6_personas_vacunadas` ()   BEGIN
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
      END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones`
--

CREATE TABLE `aplicaciones` (
  `id` int(11) NOT NULL,
  `id_vacuna` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `fecha_aplicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `aplicaciones`
--
DELIMITER $$
CREATE TRIGGER `prevenir_aplicacion_vencida` BEFORE INSERT ON `aplicaciones` FOR EACH ROW BEGIN
        DECLARE fecha_vencimiento DATE;
        DECLARE estado_vacuna INT;

        -- Obtener la fecha de vencimiento del lote
        SELECT fecha_venc INTO fecha_vencimiento
        FROM Lotes
        WHERE id = NEW.id_lote;

        -- Obtener el estado de la vacuna
        SELECT id_estado INTO estado_vacuna
        FROM Vacunas
        WHERE id = NEW.id_vacuna;

        -- Verificar si la vacuna está vencida o su lote ha vencido
        IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR fecha_vencimiento < CURDATE() THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'No se puede aplicar una vacuna vencida';
        END IF;
      END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descartes`
--

CREATE TABLE `descartes` (
  `id` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_ubicacion` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_descarte` date NOT NULL DEFAULT curdate(),
  `forma_descarte` enum('incineracion','autoclave','reciclaje','vertido_controlado','devolucion_proveedor') NOT NULL,
  `motivo` text NOT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 3,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `descartes`
--
DELIMITER $$
CREATE TRIGGER `actualizar_stock_descarte` AFTER INSERT ON `descartes` FOR EACH ROW BEGIN
        -- Disminuir stock en todas las ubicaciones
        UPDATE Stocks
        SET cantidad = cantidad - NEW.cantidad
        WHERE id_lote = NEW.id_lote
        ORDER BY cantidad DESC
        LIMIT 1;
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `validar_stock_descarte` BEFORE INSERT ON `descartes` FOR EACH ROW BEGIN
        DECLARE stock_actual INT;
        DECLARE lote_vencido BOOLEAN;
        
        -- Verificar stock disponible
        SELECT SUM(cantidad) INTO stock_actual
        FROM Stocks
        WHERE id_lote = NEW.id_lote;
        
        -- Verificar vencimiento
        SELECT fecha_venc < CURDATE() INTO lote_vencido
        FROM Lotes
        WHERE id = NEW.id_lote;
        
        IF NEW.id_estado != 3 AND lote_vencido THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'El lote está vencido, debe usar estado "Vencido"';
        END IF;
        
        IF stock_actual < NEW.cantidad THEN
          SIGNAL SQLSTATE '45001'
          SET MESSAGE_TEXT = 'No hay suficiente stock para descartar';
        END IF;
      END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `laboratorios`
--

CREATE TABLE `laboratorios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `nacionalidad` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes`
--

CREATE TABLE `lotes` (
  `id` int(11) NOT NULL,
  `num_lote` varchar(255) NOT NULL,
  `id_laboratorio` int(11) NOT NULL,
  `pais_origen` varchar(100) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_fab` date NOT NULL,
  `fecha_venc` date NOT NULL,
  `fecha_compra` date NOT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `lotes`
--
DELIMITER $$
CREATE TRIGGER `actualizar_estado_vencimiento` AFTER UPDATE ON `lotes` FOR EACH ROW BEGIN
        IF NEW.fecha_venc < CURDATE() THEN
          UPDATE Vacunas 
          SET id_estado = (SELECT id FROM Estados WHERE codigo = 'VENC')
          WHERE id_lote = NEW.id AND id_estado != (SELECT id FROM Estados WHERE codigo = 'APLIC');
        END IF;
      END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientolotes`
--

CREATE TABLE `movimientolotes` (
  `id` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion_origen` int(11) DEFAULT NULL,
  `id_ubicacion_destino` int(11) NOT NULL,
  `id_usuario_origen` int(11) NOT NULL,
  `id_usuario_destino` int(11) DEFAULT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_movimiento` date NOT NULL DEFAULT curdate(),
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `movimientolotes`
--
DELIMITER $$
CREATE TRIGGER `actualizar_stock_movimiento` AFTER INSERT ON `movimientolotes` FOR EACH ROW BEGIN
        -- Actualizar stock en origen (si existe)
        IF NEW.id_ubicacion_origen IS NOT NULL THEN
          UPDATE Stocks 
          SET cantidad = cantidad - NEW.cantidad
          WHERE id_lote = NEW.id_lote 
            AND id_ubicacion = NEW.id_ubicacion_origen;
        END IF;

        -- Actualizar stock en destino (upsert)
        INSERT INTO Stocks (id_lote, id_ubicacion, cantidad, createdAt, updatedAt)
        VALUES (NEW.id_lote, NEW.id_ubicacion_destino, NEW.cantidad, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          cantidad = cantidad + NEW.cantidad,
          updatedAt = NOW();
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `validar_stock_movimiento` BEFORE INSERT ON `movimientolotes` FOR EACH ROW BEGIN
        DECLARE stock_actual INT;
        IF NEW.id_ubicacion_origen IS NOT NULL THEN
          SELECT cantidad INTO stock_actual 
          FROM Stocks 
          WHERE id_lote = NEW.id_lote AND id_ubicacion = NEW.id_ubicacion_origen;
          IF stock_actual < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No hay suficiente stock para este movimiento';
          END IF;
        END IF;
      END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('Masculino','Femenino','No binario','Prefiero no decir') DEFAULT NULL,
  `localidad` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `id_provincia` int(11) DEFAULT NULL,
  `id_ubicacion_registro` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincias`
--

CREATE TABLE `provincias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `provincias`
--

INSERT INTO `provincias` (`id`, `nombre`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 'Buenos Aires', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(2, 'Catamarca', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(3, 'Chaco', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(4, 'Chubut', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(5, 'Córdoba', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(6, 'Corrientes', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(7, 'Entre Ríos', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(8, 'Formosa', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(9, 'Jujuy', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(10, 'La Pampa', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(11, 'La Rioja', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(12, 'Mendoza', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(13, 'Misiones', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(14, 'Neuquén', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(15, 'Río Negro', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(16, 'Salta', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(17, 'San Juan', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(18, 'San Luis', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(19, 'Santa Cruz', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(20, 'Santa Fe', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(21, 'Santiago del Estero', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(22, 'Tierra del Fuego', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL),
(23, 'Tucumán', '2025-07-03 13:41:54', '2025-07-03 13:41:54', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 'Administrador', '2025-07-08 13:01:54', '2025-07-08 13:01:54', NULL),
(2, 'Auditor', '2025-07-08 13:01:54', '2025-07-08 13:01:54', NULL),
(3, 'Enfermero', '2025-07-08 13:02:21', '2025-07-08 13:09:40', NULL),
(4, 'Administrativo', '2025-07-08 13:02:21', '2025-07-08 13:09:43', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20240116165420-create-rol.js'),
('20240116166818-create-usuario.js'),
('20250509165759-create-laboratorio.js'),
('20250509165843-create-lote.js'),
('20250509165952-create-estado.js'),
('20250509165953-create-vacuna.js'),
('20250513162656-create-provincia.js'),
('20250513163104-create-ubicacion.js'),
('20250519124804-create-movimiento-lote.js'),
('20250519160310-create-paciente.js'),
('20250519160503-create-usuario-ubicacion.js'),
('20250519160953-create-aplicacion.js'),
('20250519160954-create-descarte.js'),
('20250520160954-create-stock.js'),
('20250520170000-add-triggers-vencimiento.js'),
('20250521140001-create-trigger-stock.js'),
('20250527190334-add-indexes-laboratorios.js'),
('20250820155308-create-solicitudes-acceso.js'),
('20250827185529-create-sessions.js'),
('20260504100000-add-fields-lotes.js'),
('20260504100001-add-fields-pacientes.js'),
('20260504110000-add-ubicacion-to-descartes.js'),
('20260504120000-create-stored-procedures.js');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudesacceso`
--

CREATE TABLE `solicitudesacceso` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `motivo` text NOT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `tipo` enum('Deposito Nacional','Distribucion','Deposito Provincial','Centro Vacunacion','Centro Descarte','Nivel Central') NOT NULL,
  `id_provincia` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`, `direccion`, `telefono`, `tipo`, `id_provincia`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 'Nivel Central', 'Av. San Martín 123', '4455-6677', 'Deposito Provincial', 1, '2025-07-03 13:42:36', '2025-07-11 14:25:50', NULL),
(2, 'Hospital Garrahan', 'Av. Monroe 890', '11-3344-5566', 'Deposito Nacional', 1, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(3, 'Hospital Italiano', 'Av. Córdoba 1234', '11-7788-9900', 'Centro Vacunacion', 1, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(4, 'Hospital de San Isidro', 'Av. Maipú 567', '4567-8901', 'Centro Vacunacion', 1, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(5, 'Hospital de San Nicolás', 'Av. España 89', '3456-7890', 'Centro Vacunacion', 1, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(6, 'Hospital Regional de Catamarca', 'Av. Belgrano 100', '4411-2233', 'Centro Vacunacion', 2, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(7, 'Hospital San Roque', 'Av. San Martín 300', '4422-3344', 'Centro Vacunacion', 2, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(8, 'Hospital de Chaco', 'Av. Güemes 456', '3624-5566', 'Centro Vacunacion', 3, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(9, 'Hospital de Resistencia', 'Av. 9 de Julio 789', '3624-778899', 'Centro Vacunacion', 3, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(10, 'Hospital de Chubut', 'Av. Alvear 123', '2974-5678', 'Centro Vacunacion', 4, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(11, 'Hospital de Comodoro Rivadavia', 'Av. Rivadavia 456', '2976-7890', 'Centro Vacunacion', 4, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(12, 'Hospital de Córdoba', 'Av. Vélez Sarsfield 789', '3514-556677', 'Centro Vacunacion', 5, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(13, 'Hospital Italiano de Córdoba', 'Av. Colón 234', '3516-778899', 'Centro Vacunacion', 5, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(14, 'Hospital de Corrientes', 'Av. 25 de Mayo 100', '3787-4567', 'Centro Vacunacion', 6, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(15, 'Hospital Escuela de Corrientes', 'Av. España 567', '3787-789012', 'Centro Vacunacion', 6, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(16, 'Hospital de Entre Ríos', 'Av. Sarmiento 234', '3435-6789', 'Centro Vacunacion', 7, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(17, 'Hospital de Paraná', 'Av. Entre Ríos 789', '3435-990011', 'Centro Vacunacion', 7, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(18, 'Hospital de Formosa', 'Av. La Rioja 123', '3704-5566', 'Centro Vacunacion', 8, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(19, 'Hospital de La Rioja', 'Av. Córdoba 456', '3845-6789', 'Centro Vacunacion', 9, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(20, 'Hospital de San Salvador de Jujuy', 'Av. Belgrano 789', '3884-556677', 'Centro Vacunacion', 9, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(21, 'Hospital de La Pampa', 'Av. San Martín 300', '2315-6789', 'Centro Vacunacion', 10, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(22, 'Hospital de Santa Rosa', 'Av. Rivadavia 123', '2315-990011', 'Centro Vacunacion', 10, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(23, 'Hospital de Mendoza', 'Av. San Luis 456', '2614-556677', 'Centro Vacunacion', 12, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(24, 'Hospital de San Juan', 'Av. Libertador 789', '2644-556677', 'Centro Vacunacion', 17, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(25, 'Hospital de San Luis', 'Av. Belgrano 123', '2664-556677', 'Centro Vacunacion', 18, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(26, 'Hospital de Santa Fe', 'Av. Barrientos 456', '3456-778899', 'Centro Vacunacion', 20, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(27, 'Hospital de Rosario', 'Av. Pellegrini 100', '3415-678900', 'Centro Vacunacion', 20, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(28, 'Hospital de Tucumán', 'Av. Independencia 234', '3815-678900', 'Centro Vacunacion', 23, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(29, 'Hospital de Salta', 'Av. Belgrano 567', '3874-556677', 'Centro Vacunacion', 16, '2025-07-03 13:42:36', '2025-07-03 13:42:36', NULL),
(31, 'Oca Transporte', 'CABA 123', '2224444444', 'Distribucion', 1, '2025-07-11 14:35:53', '2025-07-11 14:37:50', NULL),
(32, 'Andreani Transporte', 'Ministro Berrondo 338', '02664271316', 'Distribucion', 18, '2025-07-24 16:19:17', '2025-07-24 16:19:17', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `usuario` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `dni`, `correo`, `telefono`, `usuario`, `password`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(9, 'Edder', 'Santibañez', '93962239', 'edder709@gmail.com', '02664271316', 'Administrador', '$2b$10$9E.d3IscxjzO682zL7HRQO6.IQH1jTIXoIciYqz/o3GPkNHpDeB.i', '2026-05-04 05:05:21', '2026-05-04 05:05:21', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarioubicaciones`
--

CREATE TABLE `usuarioubicaciones` (
  `id_usuario` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarioubicaciones`
--

INSERT INTO `usuarioubicaciones` (`id_usuario`, `id_ubicacion`, `id_rol`, `createdAt`, `updatedAt`) VALUES
(9, 1, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 2, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 3, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 4, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 5, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 6, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 7, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 8, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 9, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 10, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 11, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 12, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 13, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 14, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 15, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 16, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 17, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 18, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 19, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 20, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 21, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 22, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 23, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 24, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 25, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 26, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 27, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 28, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 29, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 31, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21'),
(9, 32, 1, '2026-05-04 05:05:21', '2026-05-04 05:05:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas`
--

CREATE TABLE `vacunas` (
  `id` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(255) NOT NULL,
  `nombre_comercial` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aplicaciones`
--
ALTER TABLE `aplicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ubicacion` (`id_ubicacion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `aplicaciones_id_paciente` (`id_paciente`),
  ADD KEY `aplicaciones_id_vacuna` (`id_vacuna`),
  ADD KEY `aplicaciones_id_lote` (`id_lote`),
  ADD KEY `aplicaciones_fecha_aplicacion` (`fecha_aplicacion`);

--
-- Indices de la tabla `descartes`
--
ALTER TABLE `descartes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `descartes_id_lote` (`id_lote`),
  ADD KEY `descartes_id_usuario` (`id_usuario`),
  ADD KEY `descartes_fecha_descarte` (`fecha_descarte`),
  ADD KEY `descartes_forma_descarte` (`forma_descarte`),
  ADD KEY `Descartes_id_ubicacion_foreign_idx` (`id_ubicacion`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `laboratorios_nombre` (`nombre`),
  ADD KEY `laboratorios_nacionalidad` (`nacionalidad`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `num_lote` (`num_lote`),
  ADD KEY `id_laboratorio` (`id_laboratorio`),
  ADD KEY `lotes_num_lote` (`num_lote`),
  ADD KEY `lotes_fecha_venc` (`fecha_venc`);

--
-- Indices de la tabla `movimientolotes`
--
ALTER TABLE `movimientolotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario_origen` (`id_usuario_origen`),
  ADD KEY `id_usuario_destino` (`id_usuario_destino`),
  ADD KEY `movimiento_lotes_id_lote` (`id_lote`),
  ADD KEY `movimiento_lotes_id_ubicacion_origen` (`id_ubicacion_origen`),
  ADD KEY `movimiento_lotes_id_ubicacion_destino` (`id_ubicacion_destino`),
  ADD KEY `movimiento_lotes_fecha_movimiento` (`fecha_movimiento`),
  ADD KEY `movimiento_lotes_id_estado` (`id_estado`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `id_provincia` (`id_provincia`),
  ADD KEY `id_ubicacion_registro` (`id_ubicacion_registro`),
  ADD KEY `pacientes_apellido_nombre` (`apellido`,`nombre`);

--
-- Indices de la tabla `provincias`
--
ALTER TABLE `provincias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indices de la tabla `solicitudesacceso`
--
ALTER TABLE `solicitudesacceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `solicitudes_acceso_estado` (`estado`),
  ADD KEY `solicitudes_acceso_correo` (`correo`);

--
-- Indices de la tabla `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_lote_ubicacion_unique` (`id_lote`,`id_ubicacion`),
  ADD KEY `stocks_id_ubicacion` (`id_ubicacion`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_provincia` (`id_provincia`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `usuarios_dni` (`dni`),
  ADD KEY `usuarios_correo` (`correo`);

--
-- Indices de la tabla `usuarioubicaciones`
--
ALTER TABLE `usuarioubicaciones`
  ADD PRIMARY KEY (`id_usuario`,`id_ubicacion`),
  ADD KEY `usuario_ubicaciones_id_ubicacion_id_usuario` (`id_ubicacion`,`id_usuario`),
  ADD KEY `usuario_ubicaciones_id_rol` (`id_rol`);

--
-- Indices de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vacunas_id_lote` (`id_lote`),
  ADD KEY `vacunas_id_estado` (`id_estado`),
  ADD KEY `vacunas_tipo` (`tipo`),
  ADD KEY `vacunas_nombre_comercial` (`nombre_comercial`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aplicaciones`
--
ALTER TABLE `aplicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `descartes`
--
ALTER TABLE `descartes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientolotes`
--
ALTER TABLE `movimientolotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `provincias`
--
ALTER TABLE `provincias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `solicitudesacceso`
--
ALTER TABLE `solicitudesacceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aplicaciones`
--
ALTER TABLE `aplicaciones`
  ADD CONSTRAINT `aplicaciones_ibfk_1` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicaciones_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicaciones_ibfk_3` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicaciones_ibfk_4` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicaciones_ibfk_5` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `descartes`
--
ALTER TABLE `descartes`
  ADD CONSTRAINT `Descartes_id_ubicacion_foreign_idx` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `descartes_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `descartes_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `descartes_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`);

--
-- Filtros para la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimientolotes`
--
ALTER TABLE `movimientolotes`
  ADD CONSTRAINT `movimientolotes_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimientolotes_ibfk_2` FOREIGN KEY (`id_ubicacion_origen`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `movimientolotes_ibfk_3` FOREIGN KEY (`id_ubicacion_destino`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimientolotes_ibfk_4` FOREIGN KEY (`id_usuario_origen`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimientolotes_ibfk_5` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `movimientolotes_ibfk_6` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`id_ubicacion_registro`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD CONSTRAINT `ubicaciones_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarioubicaciones`
--
ALTER TABLE `usuarioubicaciones`
  ADD CONSTRAINT `usuarioubicaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarioubicaciones_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarioubicaciones_ibfk_3` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD CONSTRAINT `vacunas_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `vacunas_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `ev_marcar_vencimientos` ON SCHEDULE EVERY 1 DAY STARTS '2026-05-04 00:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Marca vacunas como vencidas automáticamente cada día' DO UPDATE vacunas
        SET id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)
        WHERE id_lote IN (
          SELECT id FROM lotes WHERE fecha_venc < CURDATE() AND deletedAt IS NULL
        )
        AND id_estado = (SELECT id FROM estados WHERE codigo = 'DISP' LIMIT 1)$$

DELIMITER ;

-- ============================================================
-- SEED DATA — datos de prueba para todos los módulos
-- ============================================================

-- 1. Estados (DISP=1, APLIC=2, VENC=3, DESC=4)
INSERT INTO `estados` (`id`, `nombre`, `codigo`, `createdAt`, `updatedAt`) VALUES
(1, 'Disponible',  'DISP', NOW(), NOW()),
(2, 'Aplicada',    'APLIC', NOW(), NOW()),
(3, 'Vencida',     'VENC', NOW(), NOW()),
(4, 'Descartada',  'DESC', NOW(), NOW());

-- 2. Laboratorios
INSERT INTO `laboratorios` (`id`, `nombre`, `nacionalidad`, `createdAt`, `updatedAt`) VALUES
(1, 'Pfizer-BioNTech', 'Estadounidense', NOW(), NOW()),
(2, 'AstraZeneca',     'Británica',      NOW(), NOW()),
(3, 'Sputnik',         'Rusa',           NOW(), NOW()),
(4, 'Sinopharm',       'China',          NOW(), NOW()),
(5, 'Moderna',         'Estadounidense', NOW(), NOW());

-- 3. Lotes (lotes 1-4 activos, 5-6 próximos a vencer, 7-8 vencidos)
INSERT INTO `lotes` (`id`, `num_lote`, `id_laboratorio`, `pais_origen`, `cantidad`, `fecha_fab`, `fecha_venc`, `fecha_compra`, `fecha_adquisicion`, `createdAt`, `updatedAt`) VALUES
(1, 'LOT-2025-001', 1, 'Argentina', 1000, '2024-01-01', '2027-06-30', '2025-01-15', '2025-01-20', NOW(), NOW()),
(2, 'LOT-2025-002', 2, 'India',      500, '2024-03-01', '2027-09-30', '2025-03-10', '2025-03-15', NOW(), NOW()),
(3, 'LOT-2025-003', 3, 'Rusia',      800, '2024-06-01', '2027-12-31', '2025-06-20', '2025-06-25', NOW(), NOW()),
(4, 'LOT-2025-004', 4, 'China',      600, '2024-09-01', '2027-08-31', '2025-09-05', '2025-09-10', NOW(), NOW()),
(5, 'LOT-2026-001', 5, 'Argentina',  400, '2025-01-15', '2026-05-15', '2026-01-20', '2026-01-25', NOW(), NOW()),
(6, 'LOT-2026-002', 1, 'Argentina',  300, '2025-02-01', '2026-05-25', '2026-02-10', '2026-02-15', NOW(), NOW()),
(7, 'LOT-2024-001', 2, 'India',      200, '2023-10-01', '2026-01-01', '2024-10-15', '2024-10-20', NOW(), NOW()),
(8, 'LOT-2024-002', 3, 'Rusia',      150, '2023-06-01', '2026-03-01', '2024-06-10', '2024-06-15', NOW(), NOW());

-- 4. Vacunas (1 por lote; lotes 7-8 en estado VENC=3)
INSERT INTO `vacunas` (`id`, `id_lote`, `id_estado`, `tipo`, `nombre_comercial`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'COVID-19',        'Comirnaty',     NOW(), NOW()),
(2, 2, 1, 'COVID-19',        'Vaxzevria',     NOW(), NOW()),
(3, 3, 1, 'COVID-19',        'Sputnik V',     NOW(), NOW()),
(4, 4, 1, 'Influenza',       'Sinopharm Flu', NOW(), NOW()),
(5, 5, 1, 'Fiebre Amarilla', 'Stamaril',      NOW(), NOW()),
(6, 6, 1, 'Hepatitis B',     'Engerix-B',     NOW(), NOW()),
(7, 7, 3, 'COVID-19',        'Vaxzevria',     NOW(), NOW()),
(8, 8, 3, 'COVID-19',        'Sputnik V',     NOW(), NOW());

-- 5. Usuarios adicionales (misma contraseña que el Administrador id=9)
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `dni`, `correo`, `telefono`, `usuario`, `password`, `createdAt`, `updatedAt`) VALUES
(10, 'Ana',    'García',     '28765432', 'ana.garcia@argentina.gob.ar',    '01112345678', 'Auditor',         '$2b$10$9E.d3IscxjzO682zL7HRQO6.IQH1jTIXoIciYqz/o3GPkNHpDeB.i', NOW(), NOW()),
(11, 'Carlos', 'López',      '35123456', 'carlos.lopez@argentina.gob.ar',  '01198765432', 'Enfermero',       '$2b$10$9E.d3IscxjzO682zL7HRQO6.IQH1jTIXoIciYqz/o3GPkNHpDeB.i', NOW(), NOW()),
(12, 'María',  'Rodríguez',  '42654321', 'maria.rodriguez@argentina.gob.ar','01187654321','Administrativo',  '$2b$10$9E.d3IscxjzO682zL7HRQO6.IQH1jTIXoIciYqz/o3GPkNHpDeB.i', NOW(), NOW());

-- 6. Ubicaciones para los nuevos usuarios
INSERT INTO `usuarioubicaciones` (`id_usuario`, `id_ubicacion`, `id_rol`, `createdAt`, `updatedAt`) VALUES
(10,  3, 2, NOW(), NOW()),  -- Auditor → Hospital Italiano (CV prov 1)
(10,  4, 2, NOW(), NOW()),  -- Auditor → Hospital San Isidro
(10, 12, 2, NOW(), NOW()),  -- Auditor → Hospital de Córdoba (CV prov 5)
(10, 13, 2, NOW(), NOW()),  -- Auditor → Hospital Italiano Córdoba
(11,  3, 3, NOW(), NOW()),  -- Enfermero → Hospital Italiano
(11, 12, 3, NOW(), NOW()),  -- Enfermero → Hospital de Córdoba
(12,  2, 4, NOW(), NOW());  -- Administrativo → Hospital Garrahan (Dep. Nacional)

-- 7. Pacientes
INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `dni`, `fecha_nacimiento`, `genero`, `localidad`, `telefono`, `correo`, `id_provincia`, `id_ubicacion_registro`, `createdAt`, `updatedAt`) VALUES
(1,  'Juan',     'Pérez',     '28567890', '1985-03-15', 'Masculino',        'Buenos Aires',      '1156781234', 'juan.perez@mail.com',      1,  3,  NOW(), NOW()),
(2,  'María',    'González',  '35123789', '1990-07-22', 'Femenino',         'Córdoba',           '3515678901', 'maria.gonzalez@mail.com',  5,  12, NOW(), NOW()),
(3,  'Carlos',   'López',     '42678901', '2000-11-30', 'Masculino',        'Rosario',           '3415678901', 'carlos.lopez@mail.com',    20, 27, NOW(), NOW()),
(4,  'Ana',      'Martínez',  '31456123', '1978-05-10', 'Femenino',         'Mendoza',           '2614567890', 'ana.martinez@mail.com',    12, 23, NOW(), NOW()),
(5,  'Luis',     'Ramírez',   '25987654', '1962-09-18', 'Masculino',        'Tucumán',           '3815123456', 'luis.ramirez@mail.com',    23, 28, NOW(), NOW()),
(6,  'Laura',    'Sánchez',   '38765432', '1995-02-28', 'Femenino',         'Salta',             '3874123456', 'laura.sanchez@mail.com',   16, 29, NOW(), NOW()),
(7,  'Diego',    'Torres',    '40234567', '2002-06-15', 'Masculino',        'San Isidro',        '1156781235', 'diego.torres@mail.com',    1,  4,  NOW(), NOW()),
(8,  'Patricia', 'Fernández', '22345678', '1955-12-03', 'Femenino',         'Buenos Aires',      '1156781236', 'patricia.fern@mail.com',   1,  5,  NOW(), NOW()),
(9,  'Roberto',  'Díaz',      '29876543', '1988-04-25', 'Masculino',        'Villa Carlos Paz',  '3516789012', 'roberto.diaz@mail.com',    5,  13, NOW(), NOW()),
(10, 'Mónica',   'Ruiz',      '44123456', '2005-08-11', 'Femenino',         'Santa Fe',          '3456789012', 'monica.ruiz@mail.com',     20, 26, NOW(), NOW());

-- 8. Stocks (inserción directa sin trigger)
INSERT INTO `stocks` (`id_lote`, `id_ubicacion`, `cantidad`, `createdAt`, `updatedAt`) VALUES
-- Lote 1 COVID-19 activo
(1,  2, 400, NOW(), NOW()),   -- Dep. Nacional (id=2)
(1,  3, 200, NOW(), NOW()),   -- Hospital Italiano prov.BA
(1,  4, 150, NOW(), NOW()),   -- Hospital San Isidro prov.BA
(1,  5, 100, NOW(), NOW()),   -- Hospital San Nicolás prov.BA
-- Lote 2 COVID-19 activo
(2,  2, 200, NOW(), NOW()),
(2, 12, 100, NOW(), NOW()),   -- Hospital de Córdoba
(2, 13,  80, NOW(), NOW()),   -- Hospital Italiano Córdoba
-- Lote 3 COVID-19 activo
(3,  2, 350, NOW(), NOW()),
(3, 29,  80, NOW(), NOW()),   -- Hospital de Salta
-- Lote 4 Influenza activo
(4,  2, 250, NOW(), NOW()),
(4, 23, 150, NOW(), NOW()),   -- Hospital de Mendoza
(4, 26, 100, NOW(), NOW()),   -- Hospital de Santa Fe
-- Lote 5 Fiebre Amarilla vence 2026-05-15
(5,  2, 200, NOW(), NOW()),
(5, 28, 100, NOW(), NOW()),   -- Hospital de Tucumán
-- Lote 6 Hepatitis B vence 2026-05-25
(6,  2, 150, NOW(), NOW()),
(6, 27,  80, NOW(), NOW()),   -- Hospital de Rosario
-- Lote 7 COVID-19 VENCIDO 2026-01-01 → Reporte 5
(7,  3,  80, NOW(), NOW()),   -- Hospital Italiano
(7, 12,  60, NOW(), NOW()),   -- Hospital de Córdoba
-- Lote 8 COVID-19 VENCIDO 2026-03-01 → Reporte 5
(8, 26,  70, NOW(), NOW()),   -- Hospital de Santa Fe
(8, 28,  40, NOW(), NOW());   -- Hospital de Tucumán

-- 9. Aplicaciones normales (vacunas NO vencidas al momento de la aplicación)
INSERT INTO `aplicaciones` (`id`, `id_vacuna`, `id_paciente`, `id_ubicacion`, `id_usuario`, `id_lote`, `fecha_aplicacion`, `createdAt`, `updatedAt`) VALUES
(1,  1, 1,  3, 9, 1, '2026-01-15 09:00:00', '2026-01-15 09:00:00', '2026-01-15 09:00:00'),
(2,  1, 7,  4, 9, 1, '2026-01-20 10:00:00', '2026-01-20 10:00:00', '2026-01-20 10:00:00'),
(3,  2, 2, 12, 9, 2, '2026-02-05 09:30:00', '2026-02-05 09:30:00', '2026-02-05 09:30:00'),
(4,  3, 5, 29, 9, 3, '2026-02-15 11:00:00', '2026-02-15 11:00:00', '2026-02-15 11:00:00'),
(5,  4, 4, 23, 9, 4, '2026-03-01 08:00:00', '2026-03-01 08:00:00', '2026-03-01 08:00:00'),
(6,  5, 6, 28, 9, 5, '2026-03-10 09:00:00', '2026-03-10 09:00:00', '2026-03-10 09:00:00'),
(7,  6, 3, 27, 9, 6, '2026-03-20 10:30:00', '2026-03-20 10:30:00', '2026-03-20 10:30:00'),
(8,  1, 8,  5, 9, 1, '2026-04-01 09:00:00', '2026-04-01 09:00:00', '2026-04-01 09:00:00'),
(9,  2, 9, 13, 9, 2, '2026-04-10 10:00:00', '2026-04-10 10:00:00', '2026-04-10 10:00:00'),
(10, 4, 10,26, 9, 4, '2026-04-20 11:00:00', '2026-04-20 11:00:00', '2026-04-20 11:00:00');

-- Aplicaciones de vacunas VENCIDAS (para Reporte 4: fecha_aplicacion > fecha_venc del lote)
-- Se deshabilita el trigger temporalmente para poder insertar estos datos de prueba
DROP TRIGGER IF EXISTS `prevenir_aplicacion_vencida`;

INSERT INTO `aplicaciones` (`id`, `id_vacuna`, `id_paciente`, `id_ubicacion`, `id_usuario`, `id_lote`, `fecha_aplicacion`, `createdAt`, `updatedAt`) VALUES
(11, 7, 1,  3, 9, 7, '2026-02-10 09:00:00', '2026-02-10 09:00:00', '2026-02-10 09:00:00'),
(12, 8, 2, 12, 9, 8, '2026-04-01 10:00:00', '2026-04-01 10:00:00', '2026-04-01 10:00:00');

-- Recrear trigger prevenir_aplicacion_vencida
DELIMITER $$
CREATE TRIGGER `prevenir_aplicacion_vencida` BEFORE INSERT ON `aplicaciones` FOR EACH ROW BEGIN
  DECLARE fecha_vencimiento DATE;
  DECLARE estado_vacuna INT;
  SELECT fecha_venc INTO fecha_vencimiento FROM Lotes WHERE id = NEW.id_lote;
  SELECT id_estado INTO estado_vacuna FROM Vacunas WHERE id = NEW.id_vacuna;
  IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR fecha_vencimiento < CURDATE() THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede aplicar una vacuna vencida';
  END IF;
END
$$
DELIMITER ;

-- 10. Descartes (el trigger actualizar_stock_descarte reducirá el stock del lote mayor)
INSERT INTO `descartes` (`id`, `id_lote`, `id_usuario`, `id_ubicacion`, `cantidad`, `fecha_descarte`, `forma_descarte`, `motivo`, `id_estado`, `createdAt`, `updatedAt`) VALUES
(1, 7, 9,  3, 50, '2026-02-20', 'incineracion', 'Lote vencido detectado en depósito, descarte por vencimiento',        3, NOW(), NOW()),
(2, 8, 9, 26, 40, '2026-04-05', 'autoclave',    'Lote vencido verificado en almacén, descarte obligatorio',            3, NOW(), NOW()),
(3, 5, 9, 28, 30, '2026-03-15', 'reciclaje',    'Vacunas próximas a vencer, descarte preventivo antes del vencimiento', 3, NOW(), NOW());

-- 11. Solicitudes de acceso
INSERT INTO `solicitudesacceso` (`id`, `nombre`, `apellido`, `dni`, `correo`, `telefono`, `motivo`, `estado`, `createdAt`, `updatedAt`) VALUES
(1, 'Pedro',  'Alvarado',   '33445566', 'pedro.alvarado@gmail.com',    NULL,         'Solicito acceso como enfermero para registrar aplicaciones de vacunas en el Hospital Italiano', 'Pendiente', NOW(), NOW()),
(2, 'Lucía',  'Morales',    '41789012', 'lucia.morales@gmail.com',     '01155556666','Solicito acceso para realizar auditoría del sistema de trazabilidad',                             'Aprobado',  NOW(), NOW()),
(3, 'Héctor', 'Villanueva', '27654321', 'hector.villanueva@gmail.com', NULL,         'Acceso para gestión administrativa y generación de reportes mensuales',                           'Rechazado', NOW(), NOW());

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
