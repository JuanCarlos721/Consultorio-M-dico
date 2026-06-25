-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-06-2026 a las 02:14:56
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
-- Base de datos: `sistema_consultorio`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `detalles_consulta` text DEFAULT NULL,
  `ine_paciente` varchar(20) NOT NULL,
  `ine_medico` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id_cita`, `fecha`, `hora`, `detalles_consulta`, `ine_paciente`, `ine_medico`) VALUES
(1, '2026-08-01', '09:00:00', 'Chequeo rutinario semestral', 'PAC001', 'MED001'),
(2, '2026-08-02', '10:30:00', 'Presenta fiebre y dolor de garganta', 'PAC002', 'MED002'),
(3, '2026-08-03', '11:00:00', 'Seguimiento por arritmia leve', 'PAC003', 'MED003'),
(4, '2026-08-04', '12:00:00', 'Evaluacion de alergia cutanea', 'PAC004', 'MED004'),
(5, '2026-08-05', '16:00:00', 'Crisis de migrana cronica', 'PAC005', 'MED005'),
(6, '2026-08-06', '09:30:00', 'Revision de esguince de tobillo', 'PAC006', 'MED006'),
(7, '2026-08-07', '10:00:00', 'Revision anual de rutina', 'PAC007', 'MED007'),
(8, '2026-08-08', '11:30:00', 'Examen por sospecha de miopia', 'PAC008', 'MED008'),
(9, '2026-08-09', '15:00:00', 'Consulta de seguimiento por ansiedad', 'PAC009', 'MED009'),
(10, '2026-08-10', '17:00:00', 'Seguimiento preventivo rutinario', 'PAC010', 'MED010');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historialclinico`
--

CREATE TABLE `historialclinico` (
  `id_historial` int(11) NOT NULL,
  `ine_paciente` varchar(20) NOT NULL,
  `fecha_apertura` date NOT NULL,
  `observaciones_generales` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historialclinico`
--

INSERT INTO `historialclinico` (`id_historial`, `ine_paciente`, `fecha_apertura`, `observaciones_generales`) VALUES
(1, 'PAC001', '2026-01-15', 'Paciente propenso a alergias estacionales.'),
(2, 'PAC002', '2026-02-10', 'Historial familiar de diabetes mellitus.'),
(3, 'PAC003', '2026-03-05', 'Hipertension controlada bajo tratamiento.'),
(4, 'PAC004', '2026-03-22', 'Ninguna observacion de riesgo identificada.'),
(5, 'PAC005', '2026-04-01', 'Paciente con migranas recurrentes.'),
(6, 'PAC006', '2026-04-18', 'Deportista de rendimiento mediano.'),
(7, 'PAC007', '2026-05-12', 'Revisiones anuales estables.'),
(8, 'PAC008', '2026-05-29', 'Asmatico controlado.'),
(9, 'PAC009', '2026-06-02', 'Bajo seguimiento por estres laboral.'),
(10, 'PAC010', '2026-06-11', 'Citas preventivas rutinarias.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medico`
--

CREATE TABLE `medico` (
  `ine` varchar(20) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `num_colegiado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medico`
--

INSERT INTO `medico` (`ine`, `especialidad`, `num_colegiado`) VALUES
('MED001', 'Medicina General', 'COL-1001'),
('MED002', 'Pediatria', 'COL-1002'),
('MED003', 'Cardiologia', 'COL-1003'),
('MED004', 'Dermatologia', 'COL-1004'),
('MED005', 'Neurologia', 'COL-1005'),
('MED006', 'Traumatologia', 'COL-1006'),
('MED007', 'Ginecologia', 'COL-1007'),
('MED008', 'Oftalmologia', 'COL-1008'),
('MED009', 'Psiquiatria', 'COL-1009'),
('MED010', 'Oncologia', 'COL-1010');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `ine` varchar(20) NOT NULL,
  `ine_medico_cabecera` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`ine`, `ine_medico_cabecera`) VALUES
('PAC001', 'MED001'),
('PAC004', 'MED001'),
('PAC008', 'MED001'),
('PAC002', 'MED002'),
('PAC003', 'MED003'),
('PAC005', 'MED005'),
('PAC006', 'MED006'),
('PAC007', 'MED007'),
('PAC009', 'MED009'),
('PAC010', 'MED010');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `ine` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasenia` varchar(100) NOT NULL,
  `rol` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`ine`, `nombre`, `fecha_nacimiento`, `correo`, `contrasenia`, `rol`) VALUES
('MED001', 'Roberto Gomez', '1980-05-10', 'roberto.gomez@hospital.com', 'medico123', 'Medico'),
('MED002', 'Lucia Fernandez', '1982-08-15', 'lucia.fernandez@hospital.com', 'medico123', 'Medico'),
('MED003', 'David Garcia', '1975-11-20', 'david.garcia@hospital.com', 'medico123', 'Medico'),
('MED004', 'Laura Diaz', '1988-01-25', 'laura.diaz@hospital.com', 'medico123', 'Medico'),
('MED005', 'Carlos Ruiz', '1990-02-28', 'carlos.ruiz@hospital.com', 'medico123', 'Medico'),
('MED006', 'Elena Torres', '1985-07-14', 'elena.torres@hospital.com', 'medico123', 'Medico'),
('MED007', 'Miguel Herrera', '1978-09-05', 'miguel.herrera@hospital.com', 'medico123', 'Medico'),
('MED008', 'Carmen Sanchez', '1983-12-12', 'carmen.sanchez@hospital.com', 'medico123', 'Medico'),
('MED009', 'Jorge Martinez', '1979-04-18', 'jorge.martinez@hospital.com', 'medico123', 'Medico'),
('MED010', 'Ana Lopez', '1992-10-30', 'ana.lopez@hospital.com', 'medico123', 'Medico'),
('PAC001', 'Mario Vargas', '2000-01-01', 'mario.vargas@correo.com', 'paciente123', 'Paciente'),
('PAC002', 'Teresa Mendoza', '1995-02-15', 'teresa.mendoza@correo.com', 'paciente123', 'Paciente'),
('PAC003', 'Julio Iglesias', '1980-03-20', 'julio.iglesias@correo.com', 'paciente123', 'Paciente'),
('PAC004', 'Gloria Trevi', '1985-04-25', 'gloria.trevi@correo.com', 'paciente123', 'Paciente'),
('PAC005', 'Vicente Fernandez', '1970-05-30', 'vicente.f@correo.com', 'paciente123', 'Paciente'),
('PAC006', 'Thalia Sodi', '1990-06-10', 'thalia.sodi@correo.com', 'paciente123', 'Paciente'),
('PAC007', 'Luis Miguel', '1982-07-15', 'luis.miguel@correo.com', 'paciente123', 'Paciente'),
('PAC008', 'Paulina Rubio', '1992-08-20', 'paulina.rubio@correo.com', 'paciente123', 'Paciente'),
('PAC009', 'Alejandro Fernandez', '1988-09-25', 'alejandro.f@correo.com', 'paciente123', 'Paciente'),
('PAC010', 'Chayanne Figueroa', '1985-10-30', 'chayanne.f@correo.com', 'paciente123', 'Paciente'),
('REC001', 'Pedro Sanchez', '1995-01-10', 'pedro.sanchez@hospital.com', 'recep123', 'Recepcionista'),
('REC002', 'Maria Gomez', '1993-05-15', 'maria.gomez@hospital.com', 'recep123', 'Recepcionista'),
('REC003', 'Juan Perez', '1990-11-20', 'juan.perez@hospital.com', 'recep123', 'Recepcionista'),
('REC004', 'Sofia Diaz', '1988-03-25', 'sofia.diaz@hospital.com', 'recep123', 'Recepcionista'),
('REC005', 'Luis Martinez', '1996-08-28', 'luis.martinez@hospital.com', 'recep123', 'Recepcionista'),
('REC006', 'Rosa Ramirez', '1994-07-14', 'rosa.ramirez@hospital.com', 'recep123', 'Recepcionista'),
('REC007', 'Antonio Morales', '1991-09-05', 'antonio.morales@hospital.com', 'recep123', 'Recepcionista'),
('REC008', 'Blanca Flores', '1997-12-12', 'blanca.flores@hospital.com', 'recep123', 'Recepcionista'),
('REC009', 'Fernando Cruz', '1992-04-18', 'fernando.cruz@hospital.com', 'recep123', 'Recepcionista'),
('REC010', 'Silvia Reyes', '1999-10-30', 'silvia.reyes@hospital.com', 'recep123', 'Recepcionista');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recepcionista`
--

CREATE TABLE `recepcionista` (
  `ine` varchar(20) NOT NULL,
  `turno` varchar(20) NOT NULL,
  `escritorio_asignado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recepcionista`
--

INSERT INTO `recepcionista` (`ine`, `turno`, `escritorio_asignado`) VALUES
('REC001', 'Matutino', 'Modulo Central A'),
('REC002', 'Vespertino', 'Modulo Urgencias 1'),
('REC003', 'Nocturno', 'Modulo Central B'),
('REC004', 'Matutino', 'Modulo Pediatria'),
('REC005', 'Vespertino', 'Modulo General 2'),
('REC006', 'Nocturno', 'Modulo Urgencias 2'),
('REC007', 'Matutino', 'Modulo Central A'),
('REC008', 'Vespertino', 'Modulo Pediatria'),
('REC009', 'Nocturno', 'Modulo General 1'),
('REC010', 'Matutino', 'Modulo Consulta Externa');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `reporteagenda`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `reporteagenda` (
);

-- --------------------------------------------------------

--
-- Estructura para la vista `reporteagenda`
--
DROP TABLE IF EXISTS `reporteagenda`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reporteagenda`  AS SELECT `c`.`id_cita` AS `Codigo_Cita`, `c`.`fecha` AS `Fecha_Consulta`, `c`.`hora` AS `Hora_Consulta`, `p`.`nombre` AS `Nombre_Paciente`, `per`.`nombre` AS `Nombre_Medico`, `c`.`detalles_consulta` AS `Motivo` FROM ((`cita` `c` join `paciente` `p` on(`c`.`id_paciente` = `p`.`id_paciente`)) join `persona` `per` on(`c`.`ine_medico` = `per`.`ine`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `ine_paciente` (`ine_paciente`),
  ADD KEY `ine_medico` (`ine_medico`);

--
-- Indices de la tabla `historialclinico`
--
ALTER TABLE `historialclinico`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `ine_paciente` (`ine_paciente`);

--
-- Indices de la tabla `medico`
--
ALTER TABLE `medico`
  ADD PRIMARY KEY (`ine`),
  ADD UNIQUE KEY `num_colegiado` (`num_colegiado`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`ine`),
  ADD KEY `ine_medico_cabecera` (`ine_medico_cabecera`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`ine`);

--
-- Indices de la tabla `recepcionista`
--
ALTER TABLE `recepcionista`
  ADD PRIMARY KEY (`ine`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `historialclinico`
--
ALTER TABLE `historialclinico`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`ine_paciente`) REFERENCES `paciente` (`ine`),
  ADD CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`ine_medico`) REFERENCES `medico` (`ine`);

--
-- Filtros para la tabla `historialclinico`
--
ALTER TABLE `historialclinico`
  ADD CONSTRAINT `historialclinico_ibfk_1` FOREIGN KEY (`ine_paciente`) REFERENCES `paciente` (`ine`);

--
-- Filtros para la tabla `medico`
--
ALTER TABLE `medico`
  ADD CONSTRAINT `medico_ibfk_1` FOREIGN KEY (`ine`) REFERENCES `persona` (`ine`);

--
-- Filtros para la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`ine`) REFERENCES `persona` (`ine`),
  ADD CONSTRAINT `paciente_ibfk_2` FOREIGN KEY (`ine_medico_cabecera`) REFERENCES `medico` (`ine`);

--
-- Filtros para la tabla `recepcionista`
--
ALTER TABLE `recepcionista`
  ADD CONSTRAINT `recepcionista_ibfk_1` FOREIGN KEY (`ine`) REFERENCES `persona` (`ine`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
