-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-02-2026 a las 04:24:21
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
  `cantidad` int(11) NOT NULL,
  `fecha_fab` date NOT NULL,
  `fecha_venc` date NOT NULL,
  `fecha_compra` date NOT NULL,
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
('20250827185529-create-sessions.js');

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
(6, 'Edder', 'Santibañez', '93962239', 'edder709@gmail.com', '02664271316', 'edder709@gmail.com', '$2b$10$.sxRspeV0oNWrfX/PGy8kO1.BgMBmtWVvZ7.9Jj1LWAP9/GoCbq16', '2025-09-12 14:59:14', '2025-09-12 14:59:14', NULL);

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
  ADD KEY `descartes_forma_descarte` (`forma_descarte`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
