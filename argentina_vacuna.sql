-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-06-2025 a las 04:08:22
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
        DECLARE estado_vacuna INT;
        DECLARE fecha_vencimiento DATE;
        
        -- Obtener estado y fecha de vencimiento mediante JOIN
        SELECT V.id_estado, L.fecha_venc INTO estado_vacuna, fecha_vencimiento
        FROM Vacunas V
        JOIN Lotes L ON V.id_lote = NEW.id_lote
        WHERE V.id = NEW.id_vacuna;
        
        -- Verificar estado o vencimiento directo
        IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR
           fecha_vencimiento < CURDATE() THEN
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

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id`, `nombre`, `codigo`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 'Pendiente', 'PEND', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL),
(2, 'Recepcionado', 'REC', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL),
(3, 'Almacenado', 'ALM', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL),
(4, 'Aplicado', 'APL', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL),
(5, 'Vencido', 'VEN', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL),
(6, 'Descartado', 'DES', '2025-06-18 10:00:00', '2025-06-18 10:00:00', NULL);

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

--
-- Volcado de datos para la tabla `laboratorios`
--

INSERT INTO `laboratorios` (`id`, `nombre`, `nacionalidad`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 'Pfizer', 'Estados Unidos', '2025-05-23 15:55:47', '2025-05-23 15:55:47', NULL),
(2, 'Moderna', 'Estados Unidos', '2025-05-23 15:55:47', '2025-05-23 15:55:47', NULL),
(3, 'Gamaleya', 'Rusia', '2025-05-23 15:56:24', '2025-05-26 15:38:10', NULL),
(4, 'Sanofi', 'Argentina', '2025-05-26 16:06:37', '2025-05-29 14:01:16', NULL),
(5, 'Prueb', 'Argentina', '2025-05-26 19:09:06', '2025-06-18 10:36:33', NULL),
(6, 'Pruebaa', 'Argentina', '2025-05-26 19:14:40', '2025-06-18 10:36:40', NULL),
(7, 'asd', 'Argentina', '2025-05-27 15:53:11', '2025-06-18 10:36:44', NULL),
(8, 'asda', 'Argentina', '2025-05-27 16:40:05', '2025-06-18 10:36:47', NULL),
(9, 'Pruebaaa', 'Argentina', '2025-05-27 16:40:28', '2025-06-18 10:36:51', NULL),
(10, 'mas labo', 'Argentina', '2025-05-29 14:08:15', '2025-06-18 10:36:57', NULL),
(11, 'y mas labo', 'Argentina', '2025-05-29 14:08:15', '2025-06-18 10:37:03', NULL),
(12, 'uno mas', 'Argentina', '2025-05-29 15:13:06', '2025-06-18 10:37:07', NULL),
(13, 'y va otro', 'Argentina', '2025-05-29 15:13:06', '2025-06-18 10:37:11', NULL),
(14, 'numero 11', 'Argentina', '2025-05-29 15:13:40', '2025-06-18 10:37:16', NULL),
(15, 'numero 12', 'Argentina', '2025-05-29 15:13:40', '2025-06-18 10:37:19', NULL),
(16, 'numero 13', 'Argentina', '2025-05-29 15:14:01', '2025-06-18 10:37:23', NULL),
(17, 'numero 14', 'Argentina', '2025-05-29 15:14:01', '2025-06-18 10:37:28', NULL);

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
-- Volcado de datos para la tabla `lotes`
--

INSERT INTO `lotes` (`id`, `num_lote`, `id_laboratorio`, `cantidad`, `fecha_fab`, `fecha_venc`, `fecha_compra`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, '123456', 1, 100, '2024-12-02', '2025-12-31', '2025-06-02', '2025-06-05 11:52:34', '2025-06-05 11:52:34', NULL),
(2, '12345v', 4, 100, '2024-12-02', '2025-12-31', '2025-06-02', '2025-06-05 13:09:30', '2025-06-05 13:09:30', NULL),
(3, '5678568', 2, 100, '2024-06-03', '2025-06-30', '2025-01-01', '2025-06-05 13:09:30', '2025-06-05 13:09:30', NULL),
(4, '098765', 3, 200, '2025-05-01', '2025-12-31', '2025-06-12', '2025-06-12 16:00:01', '2025-06-17 18:38:28', NULL),
(5, 'LOT-011', 1, 1000, '2025-01-01', '2026-12-31', '2024-12-15', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(6, 'LOT-012', 2, 1500, '2025-02-15', '2027-02-14', '2024-12-16', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(7, 'LOT-013', 3, 2000, '2025-03-20', '2027-03-19', '2024-12-17', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(8, 'LOT-014', 4, 1200, '2025-04-10', '2026-10-31', '2024-12-18', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(9, 'LOT-015', 5, 1800, '2025-05-05', '2027-05-04', '2024-12-19', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(10, 'LOT-016', 6, 900, '2025-06-18', '2026-06-17', '2024-12-20', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(11, 'LOT-017', 7, 1300, '2025-07-25', '2027-07-24', '2024-12-21', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(12, 'LOT-018', 8, 1700, '2025-08-30', '2027-08-29', '2024-12-22', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(13, 'LOT-019', 9, 1100, '2025-09-15', '2026-09-14', '2024-12-23', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL),
(14, 'LOT-020', 10, 2200, '2025-10-01', '2027-09-30', '2024-12-24', '2025-06-18 10:54:26', '2025-06-18 10:54:26', NULL);

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
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('20250527190334-add-indexes-laboratorios.js');

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
  `tipo` enum('Deposito Nacional','Distribucion','Deposito Provincial','Centro Vacunacion') NOT NULL,
  `id_provincia` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarioubicaciones`
--

CREATE TABLE `usuarioubicaciones` (
  `id_usuario` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
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
-- Volcado de datos para la tabla `vacunas`
--

INSERT INTO `vacunas` (`id`, `id_lote`, `id_estado`, `tipo`, `nombre_comercial`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(1, 1, 3, 'BCG', 'BCG GlaxoSmithKline', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(2, 2, 3, 'Triple Viral', 'Triple Viral Sanofi', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(3, 3, 3, 'Doble Viral', 'Doble Viral Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(4, 4, 3, 'Tetanos', 'Tetanos GSK', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(5, 5, 3, 'Hepatitis B', 'Hepatitis B Moderna', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(6, 6, 3, 'Polio', 'Polio Sabin', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(7, 7, 3, 'COVID-19', 'COVID-19 Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(8, 8, 3, 'Influenza', 'Influenza Sanofi', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(9, 9, 3, 'Neumocócica', 'Neumocócica Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(10, 10, 3, 'HPV', 'HPV Gardasil', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(11, 11, 3, 'BCG', 'BCG GSK', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(12, 12, 3, 'Triple Viral', 'Triple Viral MSD', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(13, 13, 3, 'Doble Viral', 'Doble Viral Sanofi', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(14, 14, 3, 'Tetanos', 'Tetanos Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(15, 1, 4, 'BCG', 'BCG GlaxoSmithKline', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(16, 2, 4, 'Triple Viral', 'Triple Viral Sanofi', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(17, 3, 4, 'Doble Viral', 'Doble Viral Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(18, 4, 4, 'Tetanos', 'Tetanos GSK', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(19, 5, 4, 'Hepatitis B', 'Hepatitis B Moderna', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(20, 6, 4, 'Polio', 'Polio Sabin', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(21, 7, 4, 'COVID-19', 'COVID-19 Pfizer', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL),
(22, 8, 4, 'Influenza', 'Influenza Sanofi', '2025-06-18 10:54:54', '2025-06-18 10:54:54', NULL);

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
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `usuarios_dni` (`dni`),
  ADD KEY `usuarios_correo` (`correo`);

--
-- Indices de la tabla `usuarioubicaciones`
--
ALTER TABLE `usuarioubicaciones`
  ADD PRIMARY KEY (`id_usuario`,`id_ubicacion`),
  ADD KEY `usuario_ubicaciones_id_ubicacion_id_usuario` (`id_ubicacion`,`id_usuario`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `laboratorios`
--
ALTER TABLE `laboratorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
  ADD CONSTRAINT `movimientolotes_ibfk_4` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

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
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarioubicaciones`
--
ALTER TABLE `usuarioubicaciones`
  ADD CONSTRAINT `usuarioubicaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usuarioubicaciones_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
