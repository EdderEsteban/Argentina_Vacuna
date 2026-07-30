-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: argentina_vacuna
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aplicaciones`
--

DROP TABLE IF EXISTS `aplicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aplicaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_vacuna` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `fecha_aplicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_ubicacion` (`id_ubicacion`),
  KEY `id_usuario` (`id_usuario`),
  KEY `aplicaciones_id_paciente` (`id_paciente`),
  KEY `aplicaciones_id_vacuna` (`id_vacuna`),
  KEY `aplicaciones_id_lote` (`id_lote`),
  KEY `aplicaciones_fecha_aplicacion` (`fecha_aplicacion`),
  CONSTRAINT `aplicaciones_ibfk_1` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `aplicaciones_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `aplicaciones_ibfk_3` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `aplicaciones_ibfk_4` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `aplicaciones_ibfk_5` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aplicaciones`
--

LOCK TABLES `aplicaciones` WRITE;
/*!40000 ALTER TABLE `aplicaciones` DISABLE KEYS */;
INSERT INTO `aplicaciones` VALUES (1,1,1,3,9,1,'2026-01-15 09:00:00','2026-01-15 09:00:00','2026-01-15 09:00:00',NULL),(2,1,7,4,9,1,'2026-01-20 10:00:00','2026-01-20 10:00:00','2026-01-20 10:00:00',NULL),(3,2,2,12,9,2,'2026-02-05 09:30:00','2026-02-05 09:30:00','2026-02-05 09:30:00',NULL),(4,3,5,29,9,3,'2026-02-15 11:00:00','2026-02-15 11:00:00','2026-02-15 11:00:00',NULL),(5,4,4,23,9,4,'2026-03-01 08:00:00','2026-03-01 08:00:00','2026-03-01 08:00:00',NULL),(6,5,6,28,9,5,'2026-03-10 09:00:00','2026-03-10 09:00:00','2026-03-10 09:00:00',NULL),(7,6,3,27,9,6,'2026-03-20 10:30:00','2026-03-20 10:30:00','2026-03-20 10:30:00',NULL),(8,1,8,5,9,1,'2026-04-01 09:00:00','2026-04-01 09:00:00','2026-04-01 09:00:00',NULL),(9,2,9,13,9,2,'2026-04-10 10:00:00','2026-04-10 10:00:00','2026-04-10 10:00:00',NULL),(10,4,10,26,9,4,'2026-04-20 11:00:00','2026-04-20 11:00:00','2026-04-20 11:00:00',NULL),(11,7,1,3,9,7,'2026-02-10 09:00:00','2026-02-10 09:00:00','2026-02-10 09:00:00',NULL),(12,8,2,12,9,8,'2026-04-01 10:00:00','2026-04-01 10:00:00','2026-04-01 10:00:00',NULL),(14,1,1,3,20,1,'2026-05-27 00:00:00','2026-05-27 18:40:12','2026-05-27 18:40:12',NULL),(16,1,1,3,20,1,'2026-05-27 00:00:00','2026-05-27 18:40:45','2026-05-27 18:40:45',NULL),(18,9,7,3,11,9,'2026-06-02 00:00:00','2026-06-02 14:24:07','2026-06-02 14:24:07',NULL),(19,2,7,12,11,2,'2026-07-27 00:00:00','2026-07-27 01:54:33','2026-07-27 01:54:33',NULL),(20,20,14,4,24,20,'2026-05-09 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(21,9,39,12,26,9,'2026-06-03 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(22,1,32,12,27,1,'2026-05-05 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(23,4,24,14,13,4,'2026-05-10 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(24,3,10,3,21,3,'2026-05-10 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(25,9,47,12,11,9,'2026-05-07 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(26,19,55,3,11,19,'2026-06-12 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(27,10,17,12,11,10,'2026-05-02 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(28,19,31,3,20,19,'2026-07-24 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(29,18,14,12,11,18,'2026-05-12 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(30,11,56,4,23,11,'2026-05-13 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(31,18,46,12,27,18,'2026-06-12 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(32,20,35,27,30,20,'2026-05-15 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(33,19,11,3,21,19,'2026-07-29 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(34,2,33,3,21,2,'2026-07-20 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(35,11,34,3,21,11,'2026-07-07 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(36,12,10,27,29,12,'2026-06-02 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(37,9,17,3,11,9,'2026-06-24 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(38,20,25,12,27,20,'2026-07-28 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(39,4,19,12,26,4,'2026-05-05 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(40,21,9,12,27,21,'2026-07-22 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(41,20,30,27,29,20,'2026-07-05 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(42,2,20,14,13,2,'2026-06-24 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(43,11,53,14,13,11,'2026-06-18 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(44,21,44,3,11,21,'2026-06-08 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(45,9,39,27,29,9,'2026-06-15 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(46,13,58,4,24,13,'2026-06-20 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(47,1,21,14,13,1,'2026-05-07 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(48,9,20,28,32,9,'2026-06-04 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(49,12,48,12,11,12,'2026-07-14 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(50,3,51,4,24,3,'2026-05-08 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(51,19,14,4,23,19,'2026-06-05 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(52,10,28,27,30,10,'2026-06-15 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(53,9,46,4,23,9,'2026-06-25 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(54,10,7,28,32,10,'2026-06-14 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(55,20,20,28,32,20,'2026-07-21 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(56,1,60,4,24,1,'2026-05-08 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(57,20,49,4,24,20,'2026-07-26 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(58,9,8,3,20,9,'2026-05-04 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(59,21,14,12,26,21,'2026-06-14 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(60,4,3,12,11,4,'2026-06-26 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(61,20,30,3,11,20,'2026-05-07 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(62,11,29,27,30,11,'2026-05-07 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(63,1,44,27,29,1,'2026-05-10 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(64,1,42,3,11,1,'2026-06-12 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(65,2,50,27,29,2,'2026-05-08 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(66,18,18,12,26,18,'2026-05-21 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(67,11,23,12,27,11,'2026-05-15 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(68,12,2,4,24,12,'2026-07-15 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(69,18,40,3,20,18,'2026-07-17 09:21:22','2026-07-29 06:21:22','2026-07-29 06:21:22',NULL);
/*!40000 ALTER TABLE `aplicaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prevenir_aplicacion_vencida` BEFORE INSERT ON `aplicaciones` FOR EACH ROW BEGIN
  DECLARE fecha_vencimiento DATE;
  DECLARE estado_vacuna INT;
  SELECT fecha_venc INTO fecha_vencimiento FROM Lotes WHERE id = NEW.id_lote;
  SELECT id_estado INTO estado_vacuna FROM Vacunas WHERE id = NEW.id_vacuna;
  IF estado_vacuna = (SELECT id FROM Estados WHERE codigo = 'VENC') OR fecha_vencimiento < CURDATE() THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede aplicar una vacuna vencida';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `descartes`
--

DROP TABLE IF EXISTS `descartes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `descartes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_estado` (`id_estado`),
  KEY `descartes_id_lote` (`id_lote`),
  KEY `descartes_id_usuario` (`id_usuario`),
  KEY `descartes_fecha_descarte` (`fecha_descarte`),
  KEY `descartes_forma_descarte` (`forma_descarte`),
  KEY `Descartes_id_ubicacion_foreign_idx` (`id_ubicacion`),
  CONSTRAINT `Descartes_id_ubicacion_foreign_idx` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `descartes_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `descartes_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `descartes_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descartes`
--

LOCK TABLES `descartes` WRITE;
/*!40000 ALTER TABLE `descartes` DISABLE KEYS */;
INSERT INTO `descartes` VALUES (1,7,9,3,50,'2026-02-20','incineracion','Lote vencido detectado en depósito, descarte por vencimiento',3,'2026-05-07 14:42:43','2026-05-07 14:42:43',NULL),(2,8,9,26,40,'2026-04-05','autoclave','Lote vencido verificado en almacén, descarte obligatorio',3,'2026-05-07 14:42:43','2026-05-07 14:42:43',NULL),(3,5,9,28,30,'2026-03-15','reciclaje','Vacunas próximas a vencer, descarte preventivo antes del vencimiento',3,'2026-05-07 14:42:43','2026-05-07 14:42:43',NULL);
/*!40000 ALTER TABLE `descartes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `validar_stock_descarte` BEFORE INSERT ON `descartes` FOR EACH ROW BEGIN
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
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `actualizar_stock_descarte` AFTER INSERT ON `descartes` FOR EACH ROW BEGIN
        IF NEW.id_ubicacion IS NOT NULL THEN
          UPDATE Stocks
          SET cantidad = cantidad - NEW.cantidad
          WHERE id_lote = NEW.id_lote AND id_ubicacion = NEW.id_ubicacion;
        END IF;
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `estados`
--

DROP TABLE IF EXISTS `estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados`
--

LOCK TABLES `estados` WRITE;
/*!40000 ALTER TABLE `estados` DISABLE KEYS */;
INSERT INTO `estados` VALUES (1,'Disponible','DISP','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(2,'Aplicada','APLIC','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(3,'Vencida','VENC','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(4,'Descartada','DESC','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL);
/*!40000 ALTER TABLE `estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratorios`
--

DROP TABLE IF EXISTS `laboratorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laboratorios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `nacionalidad` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `laboratorios_nombre` (`nombre`),
  KEY `laboratorios_nacionalidad` (`nacionalidad`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratorios`
--

LOCK TABLES `laboratorios` WRITE;
/*!40000 ALTER TABLE `laboratorios` DISABLE KEYS */;
INSERT INTO `laboratorios` VALUES (1,'Pfizer-BioNTech','Estadounidense','2026-05-07 14:42:42','2026-05-27 18:48:35',NULL),(2,'AstraZeneca','Británica','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(3,'Sputnik','Rusa','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(4,'Sinopharm','China','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(5,'Moderna','Estadounidense','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL);
/*!40000 ALTER TABLE `laboratorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `num_lote` (`num_lote`),
  KEY `id_laboratorio` (`id_laboratorio`),
  KEY `lotes_num_lote` (`num_lote`),
  KEY `lotes_fecha_venc` (`fecha_venc`),
  CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,'LOT-2025-001',1,'Argentina',1000,'2024-01-01','2027-06-30','2025-01-15','2025-01-20','2026-05-07 14:42:42','2026-05-27 18:51:15',NULL),(2,'LOT-2025-002',2,'India',500,'2024-03-01','2027-09-30','2025-03-10','2025-03-15','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(3,'LOT-2025-003',3,'Rusia',800,'2024-06-01','2027-12-31','2025-06-20','2025-06-25','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(4,'LOT-2025-004',4,'China',600,'2024-09-01','2027-08-31','2025-09-05','2025-09-10','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(5,'LOT-2026-001',5,'Argentina',400,'2025-01-15','2026-05-15','2026-01-20','2026-01-25','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(6,'LOT-2026-002',1,'Argentina',300,'2025-02-01','2026-05-25','2026-02-10','2026-02-15','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(7,'LOT-2024-001',2,'India',200,'2023-10-01','2026-01-01','2024-10-15','2024-10-20','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(8,'LOT-2024-002',3,'Rusia',150,'2023-06-01','2026-03-01','2024-06-10','2024-06-15','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(9,'LOT-PFZ-2025',1,'Alemania',1500,'2024-06-01','2027-06-01','2025-01-10','2025-02-01','2026-05-19 15:38:44','2026-05-19 15:38:44',NULL),(10,'LOT-AST-2025',2,'Reino Unido',1200,'2024-05-01','2027-05-01','2025-01-12','2025-02-05','2026-05-19 15:38:46','2026-05-19 15:38:46',NULL),(11,'LOT-MOD-2025',5,'Estados Unidos',1000,'2024-07-01','2027-07-01','2025-01-15','2025-02-10','2026-05-19 15:38:48','2026-05-19 15:38:48',NULL),(12,'LOT-SIN-2025',4,'China',800,'2024-04-01','2027-04-01','2025-01-08','2025-01-25','2026-05-19 15:38:50','2026-05-19 15:38:50',NULL),(13,'LOT-SPU-2025',3,'Rusia',500,'2024-08-01','2027-08-01','2025-01-20','2025-02-15','2026-05-19 15:38:52','2026-05-19 15:38:52',NULL),(18,'PW-NCL-2026-001',1,'Estados Unidos',2000,'2026-01-01','2027-06-30','2026-05-01','2026-05-10','2026-05-19 18:26:15','2026-05-19 18:26:15',NULL),(19,'PW-NCL-2026-002',2,'Reino Unido',1500,'2026-01-15','2027-07-15','2026-05-01','2026-05-10','2026-05-19 18:26:19','2026-05-19 18:26:19',NULL),(20,'PW-NCL-2026-003',3,'Rusia',1000,'2026-02-01','2027-08-01','2026-05-02','2026-05-12','2026-05-19 18:26:22','2026-05-19 18:26:22',NULL),(21,'PW-NCL-2026-004',4,'China',500,'2026-02-15','2027-09-15','2026-05-02','2026-05-12','2026-05-19 18:26:25','2026-05-19 18:26:25',NULL);
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `actualizar_estado_vencimiento` AFTER UPDATE ON `lotes` FOR EACH ROW BEGIN
        IF NEW.fecha_venc < CURDATE() THEN
          UPDATE Vacunas 
          SET id_estado = (SELECT id FROM Estados WHERE codigo = 'VENC')
          WHERE id_lote = NEW.id AND id_estado != (SELECT id FROM Estados WHERE codigo = 'APLIC');
        END IF;
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `movimientolotes`
--

DROP TABLE IF EXISTS `movimientolotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientolotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion_origen` int(11) DEFAULT NULL,
  `id_ubicacion_destino` int(11) NOT NULL,
  `id_usuario_origen` int(11) NOT NULL,
  `id_usuario_destino` int(11) DEFAULT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_movimiento` date NOT NULL DEFAULT curdate(),
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `id_transporte` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario_origen` (`id_usuario_origen`),
  KEY `id_usuario_destino` (`id_usuario_destino`),
  KEY `movimiento_lotes_id_lote` (`id_lote`),
  KEY `movimiento_lotes_id_ubicacion_origen` (`id_ubicacion_origen`),
  KEY `movimiento_lotes_id_ubicacion_destino` (`id_ubicacion_destino`),
  KEY `movimiento_lotes_fecha_movimiento` (`fecha_movimiento`),
  KEY `movimiento_lotes_id_estado` (`id_estado`),
  KEY `MovimientoLotes_id_transporte_foreign_idx` (`id_transporte`),
  CONSTRAINT `MovimientoLotes_id_transporte_foreign_idx` FOREIGN KEY (`id_transporte`) REFERENCES `transportes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_2` FOREIGN KEY (`id_ubicacion_origen`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_3` FOREIGN KEY (`id_ubicacion_destino`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_4` FOREIGN KEY (`id_usuario_origen`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_5` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `movimientolotes_ibfk_6` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientolotes`
--

LOCK TABLES `movimientolotes` WRITE;
/*!40000 ALTER TABLE `movimientolotes` DISABLE KEYS */;
INSERT INTO `movimientolotes` VALUES (1,9,1,1,9,NULL,NULL,500,'2026-05-19',1,NULL,'2026-05-19 15:38:54','2026-05-19 15:26:52',NULL),(2,9,1,1,9,NULL,NULL,500,'2026-05-19',1,NULL,'2026-05-19 15:42:20','2026-05-19 15:26:56',NULL),(3,10,1,5,9,NULL,NULL,500,'2026-05-19',1,NULL,'2026-05-19 15:42:30','2026-05-19 15:26:58',NULL),(4,11,1,6,9,NULL,NULL,500,'2026-05-19',1,1,'2026-05-19 15:42:40','2026-05-27 17:55:37',NULL),(5,13,1,8,9,NULL,NULL,500,'2026-05-19',1,2,'2026-05-19 15:42:50','2026-05-27 17:55:37',NULL),(6,9,1,3,9,9,'2026-05-19 15:43:19',500,'2026-05-19',1,1,'2026-05-19 15:43:00','2026-05-19 15:27:05',NULL),(7,10,1,12,9,9,'2026-05-19 15:43:29',500,'2026-05-19',1,2,'2026-05-19 15:43:10','2026-05-19 15:27:07',NULL),(10,18,1,2,14,17,'2026-05-19 18:26:39',1500,'2026-05-19',1,1,'2026-05-19 18:26:31','2026-05-19 18:26:39',NULL),(11,19,1,2,14,NULL,NULL,1500,'2026-05-19',1,2,'2026-05-19 18:26:35','2026-05-27 17:55:37',NULL),(12,1,2,1,9,NULL,NULL,1,'2026-05-27',1,NULL,'2026-05-27 18:37:18','2026-05-27 18:37:18',NULL),(13,1,2,2,9,NULL,NULL,1,'2026-05-27',1,NULL,'2026-05-27 18:37:18','2026-05-27 18:37:18',NULL),(15,1,2,1,9,NULL,NULL,1,'2026-05-27',1,NULL,'2026-05-27 18:40:12','2026-05-27 18:40:12',NULL),(16,1,2,1,9,NULL,NULL,1,'2026-05-27',1,NULL,'2026-05-27 18:40:45','2026-05-27 18:40:45',NULL);
/*!40000 ALTER TABLE `movimientolotes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `validar_stock_movimiento` BEFORE INSERT ON `movimientolotes` FOR EACH ROW BEGIN
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
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `actualizar_stock_movimiento` AFTER INSERT ON `movimientolotes` FOR EACH ROW BEGIN
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
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  KEY `id_provincia` (`id_provincia`),
  KEY `id_ubicacion_registro` (`id_ubicacion_registro`),
  KEY `pacientes_apellido_nombre` (`apellido`,`nombre`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`id_ubicacion_registro`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,'Juan','Pérez','28567890','1985-03-15','Masculino','Buenos Aires','1156781234','juan.perez@mail.com',1,3,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(2,'María','González','35123789','1990-07-22','Femenino','Córdoba','3515678901','maria.gonzalez@mail.com',5,12,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(3,'Carlos','López','42678901','2000-11-30','Masculino','Rosario','3415678901','carlos.lopez@mail.com',20,27,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(4,'Ana','Martínez','31456123','1978-05-10','Femenino','Mendoza','2614567890','ana.martinez@mail.com',12,23,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(5,'Luis','Ramírez','25987654','1962-09-18','Masculino','Tucumán','3815123456','luis.ramirez@mail.com',23,28,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(6,'Laura','Sánchez','38765432','1995-02-28','Femenino','Salta','3874123456','laura.sanchez@mail.com',16,29,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(7,'Diego','Torres','40234567','2002-06-15','Masculino','San Isidro','1156781235','diego.torres@mail.com',1,4,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(8,'Patricia','Fernández','22345678','1955-12-03','Femenino','Buenos Aires','1156781236','patricia.fern@mail.com',1,5,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(9,'Roberto','Díaz','29876543','1988-04-25','Masculino','Villa Carlos Paz','3516789012','roberto.diaz@mail.com',5,13,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(10,'Mónica','Ruiz','44123456','2005-08-11','Femenino','Santa Fe','3456789012','monica.ruiz@mail.com',20,26,'2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(11,'Carlos','Cabrera','46000000','1960-06-07','Masculino','Km 5','1125849460','carlos.cabrera0@mail.com',19,11,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(12,'Facundo','Luna','46000001','2013-09-17','No binario','Los Álamos','1170964013','facundo.luna1@mail.com',10,11,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(13,'Federico','Benítez','46000002','1982-02-12','Prefiero no decir','Villa del Parque','1121416129','federico.benítez2@mail.com',12,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(14,'Carla','Torres','46000003','1986-01-22','Femenino','Villa del Parque','1150665088','carla.torres3@mail.com',1,18,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(15,'Micaela','López','46000004','1966-05-20','Femenino','Barrio Sur','1100364959','micaela.lópez4@mail.com',12,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(16,'Federico','Rodríguez','46000005','1981-06-28','Masculino','Km 5','1120567280','federico.rodríguez5@mail.com',18,20,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(17,'Emiliano','Torres','46000006','1980-11-07','No binario','Belgrano','1132178433','emiliano.torres6@mail.com',9,23,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(18,'Tomás','Cabrera','46000007','2002-04-04','Prefiero no decir','San Martín','1145316753','tomás.cabrera7@mail.com',12,28,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(19,'Laura','Rodríguez','46000008','1970-09-12','Femenino','Barrio Sur','1109368608','laura.rodríguez8@mail.com',15,16,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(20,'Roberto','López','46000009','1971-03-10','Femenino','Villa del Parque','1137118015','roberto.lópez9@mail.com',21,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(21,'Lucía','Pérez','46000010','2010-10-02','Femenino','San Martín','1130452895','lucía.pérez10@mail.com',10,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(22,'Martín','Ramírez','46000011','1973-08-28','Femenino','Villa Nueva','1186024624','martín.ramírez11@mail.com',22,18,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(23,'María','Acosta','46000012','1988-09-08','Femenino','Km 5','1114843845','maría.acosta12@mail.com',20,22,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(24,'Marcos','Ortiz','46000013','1959-01-10','Prefiero no decir','Barrio Sur','1178257819','marcos.ortiz13@mail.com',10,26,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(25,'Agustín','González','46000014','1964-12-22','Femenino','La Loma','1121703636','agustín.gonzález14@mail.com',11,3,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(26,'Luis','López','46000015','1963-12-25','Prefiero no decir','Villa Nueva','1184451081','luis.lópez15@mail.com',2,15,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(27,'Emiliano','López','46000016','1981-07-10','Masculino','El Molino','1140158077','emiliano.lópez16@mail.com',9,7,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(28,'Carlos','Acosta','46000017','1970-04-09','Masculino','Villa del Parque','1155997268','carlos.acosta17@mail.com',15,13,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(29,'Carmen','Torres','46000018','1950-01-18','Femenino','Las Flores','1190866579','carmen.torres18@mail.com',15,3,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(30,'Silvia','Luna','46000019','2011-01-08','Femenino','La Loma','1143915351','silvia.luna19@mail.com',8,20,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(31,'Ricardo','Ramírez','46000020','1980-07-27','Prefiero no decir','El Molino','1112247135','ricardo.ramírez20@mail.com',7,18,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(32,'Luis','Benítez','46000021','2004-03-14','Prefiero no decir','Km 5','1102617626','luis.benítez21@mail.com',6,9,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(33,'Carla','Ortiz','46000022','1971-02-08','Femenino','Los Álamos','1152036882','carla.ortiz22@mail.com',22,20,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(34,'Laura','Medina','46000023','1968-10-06','Femenino','Centro','1129565661','laura.medina23@mail.com',5,17,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(35,'Carmen','Gómez','46000024','1964-07-13','Femenino','Las Flores','1195375703','carmen.gómez24@mail.com',9,20,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(36,'Julieta','Aguirre','46000025','1974-03-15','Femenino','Villa Nueva','1158910956','julieta.aguirre25@mail.com',20,14,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(37,'Sebastián','Aguirre','46000026','2008-06-11','Prefiero no decir','Barrio Sur','1106951158','sebastián.aguirre26@mail.com',23,33,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(38,'Sofía','Flores','46000027','1953-05-09','Femenino','San Martín','1198080408','sofía.flores27@mail.com',19,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(39,'Rocío','Martínez','46000028','1975-02-01','Femenino','Km 5','1147000334','rocío.martínez28@mail.com',9,6,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(40,'Roberto','Aguirre','46000029','1945-01-28','Prefiero no decir','Barrio Norte','1196345759','roberto.aguirre29@mail.com',16,26,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(41,'Federico','Aguirre','46000030','2005-02-17','Prefiero no decir','Barrio Sur','1199462504','federico.aguirre30@mail.com',17,3,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(42,'Facundo','Acosta','46000031','1982-05-10','Masculino','Villa Nueva','1130249778','facundo.acosta31@mail.com',7,26,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(43,'Nicolás','Gómez','46000032','1991-05-26','No binario','Barrio Norte','1190288286','nicolás.gómez32@mail.com',21,19,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(44,'Verónica','Cabrera','46000033','1988-05-15','Femenino','San Martín','1153776350','verónica.cabrera33@mail.com',10,5,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(45,'Agustín','Ruiz','46000034','1974-02-13','Prefiero no decir','Los Álamos','1133335572','agustín.ruiz34@mail.com',5,25,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(46,'Juan','Fernández','46000035','1956-12-01','Masculino','Villa del Parque','1187478816','juan.fernández35@mail.com',10,5,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(47,'Florencia','Gómez','46000036','1953-07-03','Femenino','Los Álamos','1132949037','florencia.gómez36@mail.com',11,23,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(48,'Ricardo','Martínez','46000037','1965-10-01','Masculino','Barrio Norte','1120932699','ricardo.martínez37@mail.com',13,13,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(49,'Carlos','Castro','46000038','1973-06-10','Prefiero no decir','Las Flores','1107972677','carlos.castro38@mail.com',18,16,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(50,'Andrés','Herrera','46000039','1970-02-06','No binario','El Molino','1164316008','andrés.herrera39@mail.com',1,23,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(51,'Natalia','Cabrera','46000040','1983-03-05','Femenino','Villa del Parque','1137060398','natalia.cabrera40@mail.com',22,29,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(52,'Sebastián','González','46000041','1990-10-14','Prefiero no decir','Barrio Norte','1181790198','sebastián.gonzález41@mail.com',19,21,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(53,'Lucía','Fernández','46000042','1964-06-05','Femenino','Barrio Norte','1144859138','lucía.fernández42@mail.com',2,24,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(54,'Pablo','Pérez','46000043','1986-02-17','Prefiero no decir','El Molino','1111118150','pablo.pérez43@mail.com',13,8,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(55,'Mónica','Cabrera','46000044','1980-11-16','Femenino','El Molino','1179058486','mónica.cabrera44@mail.com',5,12,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(56,'Ana','Flores','46000045','1950-01-08','Femenino','Barrio Norte','1150553499','ana.flores45@mail.com',7,6,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(57,'Hugo','Gómez','46000046','1996-05-04','Masculino','Barrio Sur','1121712143','hugo.gómez46@mail.com',18,33,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(58,'Camila','Rodríguez','46000047','2004-12-01','Femenino','Barrio Norte','1127276008','camila.rodríguez47@mail.com',22,22,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(59,'Micaela','Silva','46000048','1966-06-06','Femenino','Centro','1130270999','micaela.silva48@mail.com',22,14,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL),(60,'Federico','Pérez','46000049','1973-07-06','No binario','Los Álamos','1125853312','federico.pérez49@mail.com',22,3,'2026-07-29 06:21:22','2026-07-29 06:21:22',NULL);
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provincias`
--

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provincias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincias`
--

LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
INSERT INTO `provincias` VALUES (1,'Buenos Aires','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(2,'Catamarca','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(3,'Chaco','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(4,'Chubut','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(5,'Córdoba','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(6,'Corrientes','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(7,'Entre Ríos','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(8,'Formosa','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(9,'Jujuy','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(10,'La Pampa','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(11,'La Rioja','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(12,'Mendoza','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(13,'Misiones','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(14,'Neuquén','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(15,'Río Negro','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(16,'Salta','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(17,'San Juan','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(18,'San Luis','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(19,'Santa Cruz','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(20,'Santa Fe','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(21,'Santiago del Estero','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(22,'Tierra del Fuego','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL),(23,'Tucumán','2025-07-03 13:41:54','2025-07-03 13:41:54',NULL);
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','2025-07-08 13:01:54','2025-07-08 13:01:54',NULL),(2,'Auditor','2025-07-08 13:01:54','2025-07-08 13:01:54',NULL),(3,'Enfermero','2025-07-08 13:02:21','2025-07-08 13:09:40',NULL),(4,'Administrativo','2025-07-08 13:02:21','2025-07-08 13:09:43',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20240116165420-create-rol.js'),('20240116166818-create-usuario.js'),('20250509165759-create-laboratorio.js'),('20250509165843-create-lote.js'),('20250509165952-create-estado.js'),('20250509165953-create-vacuna.js'),('20250513162656-create-provincia.js'),('20250513163104-create-ubicacion.js'),('20250519124804-create-movimiento-lote.js'),('20250519160310-create-paciente.js'),('20250519160503-create-usuario-ubicacion.js'),('20250519160953-create-aplicacion.js'),('20250519160954-create-descarte.js'),('20250520160954-create-stock.js'),('20250520170000-add-triggers-vencimiento.js'),('20250521140001-create-trigger-stock.js'),('20250527190334-add-indexes-laboratorios.js'),('20250820155308-create-solicitudes-acceso.js'),('20250827185529-create-sessions.js'),('20260504100000-add-fields-lotes.js'),('20260504100001-add-fields-pacientes.js'),('20260504110000-add-ubicacion-to-descartes.js'),('20260504120000-create-stored-procedures.js'),('20260507100000-add-credentials-to-solicitudes.js'),('20260513100000-create-transportes.js'),('20260513100001-add-transporte-to-movimiento-lotes.js'),('20260527123613-update-stored-procedures-ubicacion-filter.js'),('20260527152729-fix-trigger-descarte-por-ubicacion.js'),('20260529112537-fix-reporte2-vencidas-dosis.js'),('20260529121953-create-functions.js'),('20260726120000-recreate-functions.js'),('20260726130000-reporte2-por-lote.js'),('20260729120000-reportes-por-nivel.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudesacceso`
--

DROP TABLE IF EXISTS `solicitudesacceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudesacceso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `motivo` text NOT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_acceso_estado` (`estado`),
  KEY `solicitudes_acceso_correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudesacceso`
--

LOCK TABLES `solicitudesacceso` WRITE;
/*!40000 ALTER TABLE `solicitudesacceso` DISABLE KEYS */;
INSERT INTO `solicitudesacceso` VALUES (1,'Pedro','Alvarado','33445566','pedro.alvarado@gmail.com',NULL,'Solicito acceso como enfermero para registrar aplicaciones de vacunas en el Hospital Italiano','Pendiente','2026-05-07 14:42:43','2026-05-07 15:08:57',NULL,NULL,NULL),(2,'Lucía','Morales','41789012','lucia.morales@gmail.com','01155556666','Solicito acceso para realizar auditoría del sistema de trazabilidad','Aprobado','2026-05-07 14:42:43','2026-05-07 14:42:43',NULL,NULL,NULL),(3,'Héctor','Villanueva','27654321','hector.villanueva@gmail.com',NULL,'Acceso para gestión administrativa y generación de reportes mensuales','Rechazado','2026-05-07 14:42:43','2026-05-07 14:42:43',NULL,NULL,NULL),(4,'Mauricio','del Mar','12345678','mauri@delmar.com','1234567890','SOlicitud de enfermero para el hospital policlinico de san luis','Aprobado','2026-05-07 17:59:32','2026-05-07 18:00:42',NULL,'Enfer','$2b$10$NACzuB6jLu9f41ff51NQ6OTvv6Zp2rBjgP8eO0Sowqkj1xxohE9D6'),(10,'Fatima','Lebri','23234432','fatima@lebri.com.ar','2332123456','Solicito rol de auditor para hospital del sur','Aprobado','2026-06-02 00:59:49','2026-06-02 01:02:05',NULL,'fatys426','$2b$10$3efBi1dfpiOdDlpI3pVEhOjbRXsHW08n8xwwfjWSc3sDzxOLKzboK');
/*!40000 ALTER TABLE `solicitudesacceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_lote_ubicacion_unique` (`id_lote`,`id_ubicacion`),
  KEY `stocks_id_ubicacion` (`id_ubicacion`),
  CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,1,2,391,'2026-05-07 14:42:43','2026-05-27 18:51:15'),(2,1,3,197,'2026-05-07 14:42:43','2026-05-27 18:51:15'),(3,1,4,150,'2026-05-07 14:42:43','2026-05-27 18:51:15'),(4,1,5,99,'2026-05-07 14:42:43','2026-05-27 18:51:15'),(5,2,2,200,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(6,2,12,99,'2026-05-07 14:42:43','2026-07-27 01:54:33'),(7,2,13,80,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(8,3,2,350,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(9,3,29,80,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(10,4,2,250,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(11,4,23,150,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(12,4,26,100,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(13,5,2,170,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(14,5,28,100,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(15,6,2,150,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(16,6,27,80,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(17,7,3,30,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(18,7,12,60,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(19,8,26,30,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(20,8,28,40,'2026-05-07 14:42:43','2026-05-07 14:42:43'),(21,9,2,750,'2026-05-19 15:38:44','2026-05-29 15:21:43'),(22,10,2,655,'2026-05-19 15:38:46','2026-05-29 15:21:43'),(23,11,2,667,'2026-05-19 15:38:48','2026-05-29 15:21:43'),(24,12,2,800,'2026-05-19 15:38:50','2026-05-19 15:38:50'),(25,13,2,250,'2026-05-19 15:38:52','2026-05-29 15:21:43'),(26,9,1,500,'2026-05-19 15:38:54','2026-05-29 15:21:43'),(28,10,5,273,'2026-05-19 15:42:30','2026-05-29 15:21:43'),(29,11,6,333,'2026-05-19 15:42:40','2026-05-29 15:21:43'),(30,13,8,250,'2026-05-19 15:42:50','2026-05-29 15:21:43'),(31,9,3,249,'2026-05-19 15:43:00','2026-06-02 14:24:07'),(32,10,12,272,'2026-05-19 15:43:10','2026-05-29 15:21:43'),(39,18,1,500,'2026-05-19 18:26:15','2026-05-19 18:26:31'),(40,19,1,0,'2026-05-19 18:26:19','2026-05-19 18:26:35'),(41,20,1,1000,'2026-05-19 18:26:22','2026-05-19 18:26:22'),(42,21,1,500,'2026-05-19 18:26:25','2026-05-19 18:26:25'),(43,18,2,1500,'2026-05-19 18:26:31','2026-05-19 18:26:31'),(44,19,2,1500,'2026-05-19 18:26:35','2026-05-19 18:26:35'),(45,1,1,158,'2026-05-27 18:37:18','2026-05-29 15:21:43'),(49,2,1,118,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(50,3,1,369,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(51,4,1,98,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(52,5,1,99,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(53,6,1,69,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(54,7,1,59,'2026-05-29 15:21:43','2026-05-29 15:21:43'),(55,8,1,39,'2026-05-29 15:21:43','2026-05-29 15:21:43');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transportes`
--

DROP TABLE IF EXISTS `transportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transportes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `id_movil` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportes`
--

LOCK TABLES `transportes` WRITE;
/*!40000 ALTER TABLE `transportes` DISABLE KEYS */;
INSERT INTO `transportes` VALUES (1,'Correo Argentino','AA-123-BB','2026-05-19 15:38:41','2026-05-27 18:27:16',NULL),(2,'Andreani Logística','CC-456-DD','2026-05-19 15:38:42','2026-05-19 15:38:42',NULL),(3,'Correo Argentino','AA-123-BB','2026-05-19 15:40:27','2026-05-19 15:40:27',NULL),(4,'Andreani Logística','CC-456-DD','2026-05-19 15:40:29','2026-05-19 15:40:29',NULL),(5,'AuditTest','AUDIT-1779906398750','2026-05-27 18:26:38','2026-05-27 18:26:38','2026-05-27 18:26:38'),(6,'AuditTest','AUDIT-1779906436832','2026-05-27 18:27:16','2026-05-27 18:27:16','2026-05-27 18:27:16'),(7,'AuditTest','AUDIT-1779906501574','2026-05-27 18:28:21','2026-05-27 18:28:21','2026-05-27 18:28:21');
/*!40000 ALTER TABLE `transportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `tipo` enum('Deposito Nacional','Distribucion','Deposito Provincial','Centro Vacunacion','Centro Descarte','Nivel Central') NOT NULL,
  `id_provincia` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_provincia` (`id_provincia`),
  CONSTRAINT `ubicaciones_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Nivel Central','Av. San Martín 123','4455-6677','Deposito Nacional',1,'2025-07-03 13:42:36','2025-07-11 14:25:50',NULL),(2,'Deposito San Luis','Av. Monroe 890','11-3344-5566','Deposito Provincial',1,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(3,'Hospital Italiano','Av. Córdoba 1234','11-7788-9900','Centro Vacunacion',1,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(4,'Hospital de San Isidro','Av. Maipú 567','4567-8901','Centro Vacunacion',1,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(5,'Hospital de San Nicolás','Av. España 89','3456-7890','Centro Vacunacion',1,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(6,'Hospital Regional de Catamarca','Av. Belgrano 100','4411-2233','Centro Vacunacion',2,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(7,'Hospital San Roque','Av. San Martín 300','4422-3344','Centro Vacunacion',2,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(8,'Hospital de Chaco','Av. Güemes 456','3624-5566','Centro Vacunacion',3,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(9,'Hospital de Resistencia','Av. 9 de Julio 789','3624-778899','Centro Vacunacion',3,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(10,'Hospital de Chubut','Av. Alvear 123','2974-5678','Centro Vacunacion',4,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(11,'Hospital de Comodoro Rivadavia','Av. Rivadavia 456','2976-7890','Centro Vacunacion',4,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(12,'Hospital de Córdoba','Av. Vélez Sarsfield 789','3514-556677','Centro Vacunacion',5,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(13,'Hospital Italiano de Córdoba','Av. Colón 234','3516-778899','Centro Vacunacion',5,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(14,'Hospital de Corrientes','Av. 25 de Mayo 100','3787-4567','Centro Vacunacion',6,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(15,'Hospital Escuela de Corrientes','Av. España 567','3787-789012','Centro Vacunacion',6,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(16,'Hospital de Entre Ríos','Av. Sarmiento 234','3435-6789','Centro Vacunacion',7,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(17,'Hospital de Paraná','Av. Entre Ríos 789','3435-990011','Centro Vacunacion',7,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(18,'Hospital de Formosa','Av. La Rioja 123','3704-5566','Centro Vacunacion',8,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(19,'Hospital de La Rioja','Av. Córdoba 456','3845-6789','Centro Vacunacion',9,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(20,'Hospital de San Salvador de Jujuy','Av. Belgrano 789','3884-556677','Centro Vacunacion',9,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(21,'Hospital de La Pampa','Av. San Martín 300','2315-6789','Centro Vacunacion',10,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(22,'Hospital de Santa Rosa','Av. Rivadavia 123','2315-990011','Centro Vacunacion',10,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(23,'Hospital de Mendoza','Av. San Luis 456','2614-556677','Centro Vacunacion',12,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(24,'Hospital de San Juan','Av. Libertador 789','2644-556677','Centro Vacunacion',17,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(25,'Hospital de San Luis','Av. Belgrano 123','2664-556677','Centro Vacunacion',18,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(26,'Hospital de Santa Fe','Av. Barrientos 456','3456-778899','Centro Vacunacion',20,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(27,'Hospital de Rosario','Av. Pellegrini 100','3415-678900','Centro Vacunacion',20,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(28,'Hospital de Tucumán','Av. Independencia 234','3815-678900','Centro Vacunacion',23,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(29,'Hospital de Salta','Av. Belgrano 567','3874-556677','Centro Vacunacion',16,'2025-07-03 13:42:36','2025-07-03 13:42:36',NULL),(33,'Hospital del Sur','Zabala 126','4452000','Centro Vacunacion',18,'2026-06-02 01:01:36','2026-06-02 01:01:36',NULL);
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `usuario` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `usuarios_dni` (`dni`),
  KEY `usuarios_correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (9,'Edder','Santibañez','93962239','edder709@gmail.com','02664271316','Administrador','$2b$10$skYQ9DJJ1sCL1t8C81xMrOev9u7SCLt0H6jxInQS2hQYtm4Dn74lC','2026-05-04 05:05:21','2026-05-29 15:38:14',NULL),(10,'Ana','García','28765432','ana.garcia@argentina.gob.ar','01112345678','Auditor','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-07 14:42:42','2026-05-19 14:00:35',NULL),(11,'Carlos','López','35123456','carlos.lopez@argentina.gob.ar','01198765432','Enfermero','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-07 14:42:42','2026-05-19 14:00:38',NULL),(12,'María','Rodríguez','42654321','maria.rodriguez@argentina.gob.ar','01187654321','Administrativo','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-07 14:42:42','2026-05-19 14:00:43',NULL),(13,'Mauricio','del Mar','12345678','mauri@delmar.com','1234567890','Enfer','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-07 18:00:42','2026-05-19 14:01:26',NULL),(14,'Roberto','Fernández','20111001','r.fernandez@vacuna.ar','1140001001','adm.ncl1','$2b$10$NJ317aafDJ4bqcqP.CNp8.dsOod4RWJYOimtS.WCdwYj5YxK4oL8O','2026-05-19 16:58:07','2026-05-27 18:15:23',NULL),(15,'Claudia','Suárez','20111002','c.suarez@vacuna.ar','1140001002','adm.ncl2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(16,'Diego','Morales','20111003','d.morales@vacuna.ar','1140001003','aud.ncl1','$2b$10$NJ317aafDJ4bqcqP.CNp8.dsOod4RWJYOimtS.WCdwYj5YxK4oL8O','2026-05-19 16:58:07','2026-05-27 18:15:23',NULL),(17,'Valeria','Torres','20111004','v.torres@vacuna.ar','1140001004','adm.garrahan','$2b$10$NJ317aafDJ4bqcqP.CNp8.dsOod4RWJYOimtS.WCdwYj5YxK4oL8O','2026-05-19 16:58:07','2026-05-27 18:15:23',NULL),(18,'Marcos','Reyes','20111005','m.reyes@vacuna.ar','1140001005','aud.garrahan1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(19,'Lucía','Vargas','20111006','l.vargas@vacuna.ar','1140001006','aud.garrahan2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(20,'Paula','Méndez','20111007','enf.ital.1780068531207@example.com','1144556677','enf.italiano1','$2b$10$ULUGrl1wExDobvDmyGjSXOnVyeZ6L51PSGSB6u4Wfwi9V94EerH6.','2026-05-19 16:58:07','2026-05-29 15:38:14',NULL),(21,'Sebastián','Castro','20111008','s.castro@vacuna.ar','1140001008','enf.italiano2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(22,'María','González','20111009','m.gonzalez@vacuna.ar','1140001009','aud.italiano1','$2b$10$NJ317aafDJ4bqcqP.CNp8.dsOod4RWJYOimtS.WCdwYj5YxK4oL8O','2026-05-19 16:58:07','2026-05-27 18:15:23',NULL),(23,'Natalia','Romero','20111010','n.romero@vacuna.ar','1140001010','enf.sanisidro1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(24,'Federico','López','20111011','f.lopez@vacuna.ar','1140001011','enf.sanisidro2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(25,'Carmen','Ortega','20111012','c.ortega@vacuna.ar','1140001012','aud.sanisidro1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(26,'Gabriel','Martínez','20111013','g.martinez@vacuna.ar','1140001013','enf.cordoba1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(27,'Daniela','Herrera','20111014','d.herrera@vacuna.ar','1140001014','enf.cordoba2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(28,'Ricardo','Navarro','20111015','r.navarro@vacuna.ar','1140001015','aud.cordoba1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(29,'Verónica','Silva','20111016','v.silva@vacuna.ar','1140001016','enf.rosario1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(30,'Andrés','Moreno','20111017','a.moreno@vacuna.ar','1140001017','enf.rosario2','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(31,'Laura','Jiménez','20111018','l.jimenez@vacuna.ar','1140001018','aud.rosario1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(32,'Hugo','Díaz','20111019','h.diaz@vacuna.ar','1140001019','enf.tucuman1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(33,'Silvia','Peña','20111020','s.pena@vacuna.ar','1140001020','aud.tucuman1','$2b$10$QfzSYPYKCQVU9.Fhy7pUCeYKU/inF9sKSTa72p9Nglt2sspn0oNXS','2026-05-19 16:58:07','2026-05-19 16:58:07',NULL),(46,'Fatima','Lebri','23234432','fatima@lebri.com.ar','2332123456','fatys426','$2b$10$3efBi1dfpiOdDlpI3pVEhOjbRXsHW08n8xwwfjWSc3sDzxOLKzboK','2026-06-02 01:02:05','2026-06-02 01:02:05',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarioubicaciones`
--

DROP TABLE IF EXISTS `usuarioubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarioubicaciones` (
  `id_usuario` int(11) NOT NULL,
  `id_ubicacion` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_usuario`,`id_ubicacion`),
  KEY `usuario_ubicaciones_id_ubicacion_id_usuario` (`id_ubicacion`,`id_usuario`),
  KEY `usuario_ubicaciones_id_rol` (`id_rol`),
  CONSTRAINT `usuarioubicaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuarioubicaciones_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuarioubicaciones_ibfk_3` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarioubicaciones`
--

LOCK TABLES `usuarioubicaciones` WRITE;
/*!40000 ALTER TABLE `usuarioubicaciones` DISABLE KEYS */;
INSERT INTO `usuarioubicaciones` VALUES (9,1,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,2,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,3,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,4,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,5,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,6,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,7,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,8,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,9,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,10,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,11,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,12,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,13,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,14,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,15,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,16,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,17,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,18,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,19,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,20,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,21,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,22,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,23,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,24,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,25,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,26,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,27,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,28,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(9,29,1,'2026-05-04 05:05:21','2026-05-04 05:05:21'),(10,8,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(10,10,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(10,11,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(10,12,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(10,14,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(10,16,2,'2026-05-27 18:23:04','2026-05-27 18:23:04'),(11,3,3,'2026-05-07 14:42:42','2026-05-07 14:42:42'),(11,12,3,'2026-05-07 14:42:42','2026-05-07 14:42:42'),(12,2,4,'2026-05-07 14:42:42','2026-05-07 14:42:42'),(13,14,3,'2026-05-07 18:00:42','2026-05-07 18:00:42'),(14,16,4,'2026-05-19 16:58:07','2026-07-27 15:40:19'),(15,1,4,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(16,1,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(17,2,4,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(18,2,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(19,2,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(20,3,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(21,3,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(22,3,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(23,4,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(24,4,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(25,4,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(26,12,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(27,12,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(28,12,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(29,27,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(30,27,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(31,27,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(32,28,3,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(33,28,2,'2026-05-19 16:58:07','2026-05-19 16:58:07'),(46,33,2,'2026-06-02 01:02:05','2026-06-02 01:02:05');
/*!40000 ALTER TABLE `usuarioubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacunas`
--

DROP TABLE IF EXISTS `vacunas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vacunas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_lote` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(255) NOT NULL,
  `nombre_comercial` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vacunas_id_lote` (`id_lote`),
  KEY `vacunas_id_estado` (`id_estado`),
  KEY `vacunas_tipo` (`tipo`),
  KEY `vacunas_nombre_comercial` (`nombre_comercial`),
  CONSTRAINT `vacunas_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `vacunas_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunas`
--

LOCK TABLES `vacunas` WRITE;
/*!40000 ALTER TABLE `vacunas` DISABLE KEYS */;
INSERT INTO `vacunas` VALUES (1,1,1,'COVID-19','Comirnaty','2026-05-07 14:42:42','2026-05-27 18:48:35',NULL),(2,2,1,'COVID-19','Vaxzevria','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(3,3,1,'COVID-19','Sputnik V','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(4,4,1,'Influenza','Sinopharm Flu','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(5,5,1,'Fiebre Amarilla','Stamaril','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(6,6,1,'Hepatitis B','Engerix-B','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(7,7,3,'COVID-19','Vaxzevria','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(8,8,3,'COVID-19','Sputnik V','2026-05-07 14:42:42','2026-05-07 14:42:42',NULL),(9,9,1,'COVID-19 mRNA','Comirnaty','2026-05-19 15:38:44','2026-05-19 15:38:44',NULL),(10,10,1,'COVID-19','Vaxzevria','2026-05-19 15:38:46','2026-05-19 15:38:46',NULL),(11,11,1,'COVID-19 mRNA','Spikevax','2026-05-19 15:38:48','2026-05-19 15:38:48',NULL),(12,12,1,'COVID-19 Inactivada','BBIBP-CorV','2026-05-19 15:38:50','2026-05-19 15:38:50',NULL),(13,13,1,'COVID-19','Sputnik V','2026-05-19 15:38:52','2026-05-19 15:38:52',NULL),(18,18,1,'COVID-19','Comirnaty','2026-05-19 18:26:15','2026-05-19 18:26:15',NULL),(19,19,1,'COVID-19','Vaxzevria','2026-05-19 18:26:19','2026-05-19 18:26:19',NULL),(20,20,1,'COVID-19','Sputnik V','2026-05-19 18:26:22','2026-05-19 18:26:22',NULL),(21,21,1,'COVID-19','Coronavac','2026-05-19 18:26:25','2026-05-19 18:26:25',NULL);
/*!40000 ALTER TABLE `vacunas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'argentina_vacuna'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `ev_marcar_vencimientos` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = '+00:00' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `ev_marcar_vencimientos` ON SCHEDULE EVERY 1 DAY STARTS '2026-07-24 00:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Marca vacunas como vencidas automáticamente cada día' DO UPDATE vacunas
        SET id_estado = (SELECT id FROM estados WHERE codigo = 'VENC' LIMIT 1)
        WHERE id_lote IN (
          SELECT id FROM lotes WHERE fecha_venc < CURDATE() AND deletedAt IS NULL
        )
        AND id_estado = (SELECT id FROM estados WHERE codigo = 'DISP' LIMIT 1) */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'argentina_vacuna'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_dias_para_vencer` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_dias_para_vencer`(p_id_lote INT) RETURNS int(11)
    READS SQL DATA
    DETERMINISTIC
BEGIN
        DECLARE venc DATE;
        SELECT fecha_venc INTO venc FROM Lotes WHERE id = p_id_lote;
        IF venc IS NULL THEN
          RETURN NULL;
        END IF;
        RETURN DATEDIFF(venc, CURDATE());
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_stock_disponible_lote` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_stock_disponible_lote`(p_id_lote INT) RETURNS int(11)
    READS SQL DATA
    DETERMINISTIC
BEGIN
        DECLARE total INT;
        SELECT COALESCE(SUM(cantidad), 0) INTO total
        FROM Stocks
        WHERE id_lote = p_id_lote;
        RETURN total;
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte1_compras_por_laboratorio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte1_compras_por_laboratorio`(IN p_desde DATE, IN p_hasta DATE, IN p_ubicacion_id INT, IN p_provincia_id INT)
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
      AND (p_provincia_id IS NULL OR ml.id_ubicacion_destino IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))
    GROUP BY lab.id, lab.nombre, lab.nacionalidad
    ORDER BY total_dosis DESC;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte2_lotes_por_tipo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte2_lotes_por_tipo`(IN p_ubicacion_id INT, IN p_provincia_id INT)
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
              AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR s.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))), 0) AS en_ambito,
    (SELECT COUNT(*) FROM aplicaciones a WHERE a.id_lote = l.id AND a.deletedAt IS NULL
              AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR a.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))) AS aplicadas,
    COALESCE((SELECT SUM(d.cantidad) FROM descartes d WHERE d.id_lote = l.id AND d.deletedAt IS NULL
              AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR d.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))), 0) AS descartadas,
    CASE WHEN l.fecha_venc < CURDATE() THEN
      COALESCE((SELECT SUM(s.cantidad) FROM stocks s WHERE s.id_lote = l.id
              AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR s.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))), 0)
    ELSE 0 END AS vencidas
  FROM lotes l JOIN laboratorios lab ON l.id_laboratorio = lab.id
  WHERE l.deletedAt IS NULL AND (
    (p_ubicacion_id IS NULL AND p_provincia_id IS NULL)
    OR EXISTS (SELECT 1 FROM stocks s WHERE s.id_lote = l.id
        AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR s.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional')))
    OR EXISTS (SELECT 1 FROM aplicaciones a WHERE a.id_lote = l.id AND a.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR a.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional')))
    OR EXISTS (SELECT 1 FROM descartes d WHERE d.id_lote = l.id AND d.deletedAt IS NULL
        AND (p_ubicacion_id IS NULL OR d.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR d.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional')))
  )
  ORDER BY tipo_vacuna, l.num_lote;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte3_stock_por_provincia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte3_stock_por_provincia`(IN p_ubicacion_id INT, IN p_provincia_id INT)
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte4_vacunados_vencidas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte4_vacunados_vencidas`(IN p_ubicacion_id INT, IN p_provincia_id INT)
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
    AND (p_ubicacion_id IS NULL OR a.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR a.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))
  ORDER BY a.fecha_aplicacion DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte5_vencidas_no_descartadas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte5_vencidas_no_descartadas`(IN p_ubicacion_id INT, IN p_provincia_id INT)
BEGIN
  SELECT l.num_lote, vac.tipo AS tipo_vacuna, DATE_FORMAT(l.fecha_venc, '%d/%m/%Y') AS fecha_vencimiento,
    p.nombre AS provincia, u.nombre AS ubicacion, u.tipo AS tipo_ubicacion, s.cantidad AS stock_vencido
  FROM stocks s JOIN lotes l ON s.id_lote = l.id JOIN vacunas vac ON vac.id_lote = l.id
  JOIN ubicaciones u ON s.id_ubicacion = u.id LEFT JOIN provincias p ON u.id_provincia = p.id
  WHERE l.fecha_venc < CURDATE() AND s.cantidad > 0 AND l.deletedAt IS NULL
    AND (p_ubicacion_id IS NULL OR s.id_ubicacion = p_ubicacion_id) AND (p_provincia_id IS NULL OR s.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))
  ORDER BY l.fecha_venc ASC, p.nombre, u.nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte6_personas_vacunadas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte6_personas_vacunadas`(IN p_ubicacion_id INT, IN p_provincia_id INT)
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
    WHERE a.deletedAt IS NULL AND (p_provincia_id IS NULL OR a.id_ubicacion IN (SELECT id FROM ubicaciones WHERE id_provincia = p_provincia_id AND tipo <> 'Deposito Nacional'))
    GROUP BY vac.tipo, prov.id, prov.nombre, pac.localidad
    ORDER BY vac.tipo, prov.nombre, pac.localidad;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-29  6:27:10
