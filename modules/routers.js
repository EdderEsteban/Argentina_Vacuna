const router = require("express").Router();
const handler = require("./handler.js");
const laboratorio = require("../controllers/laboratorioController")
const lote = require("../controllers/loteController");
const paciente = require("../controllers/pacienteController");
const ubicacion = require("../controllers/ubicacionController");
const movimientoLote = require("../controllers/movimientoLoteController");
const loginController = require("../controllers/loginController");
const usuarios = require("../controllers/usuarioController");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


// Rutas estaticas
router.get("/", csrfProtection,handler.index);


// ---------------------------------------- Rutas de Login --------------------------------------------
router.get("/dashboard", csrfProtection,loginController.dashboard)
router.post("/login", csrfProtection, loginController.login);
router.get("/solicitud", csrfProtection, loginController.solicitud);
router.post("/nuevaSolicitud", csrfProtection, loginController.nuevaSolicitud);

// ---------------------------------------- Rutas de Usuarios ---------------------------------------
// Listar usuarios
router.get("/usuarios", csrfProtection, usuarios.listar);
// Formulario nuevo usuario
router.get('/nuevoUsuario', csrfProtection, usuarios.mostrarNuevo);
// Crear usuario
router.post('/crearUsuario', csrfProtection, usuarios.crearUsuario);
// Formulario edición usuario
router.get('/editarUsuario/:id', csrfProtection, usuarios.editarUsuario);
// Obtener ubicaciones actuales del usuario
router.get('/usuarios/:id/ubicaciones', usuarios.obtenerUbicaciones);
// Actualizar ubicaciones y roles del usuario
router.put('/usuarios/:id/ubicaciones', csrfProtection, usuarios.actualizarUbicaciones);
// Blanquear password
router.post('/usuarios/:id/blanquear', csrfProtection, usuarios.blanquearPassword);
// Consulta de roles para el modal
router.get('/roles', csrfProtection, usuarios.consultarRoles);
// Endpoint de Actualizar usuario
router.put('/actualizarUsuario/:id', csrfProtection, usuarios.actualizarUsuario);
//Eliminar usuario
router.delete('/borrarUsuario/:id', csrfProtection, usuarios.borrarUsuario);
/* Formulario de búsqueda de usuarios
router.get('/buscadorUsuario', csrfProtection, usuarios.mostrarBuscar); 
// Endpoint de búsqueda de usuarios
router.get('/buscarUsuario', csrfProtection, usuarios.buscarUsuarios); */

// --------------------------------------- Rutas de Laboratorio ---------------------------------------
// Listar laboratorios
router.get("/laboratorios", laboratorio.listar);
// Formulario nuevo
router.get('/nuevolaboratorio', csrfProtection, laboratorio.mostrarNuevo);
// Crear
router.post('/crearlaboratorio', csrfProtection, laboratorio.crearLaboratorio);
// Formulario edición
router.get('/editarlaboratorio/:id', csrfProtection, laboratorio.editarLaboratorio);
// Endpoint de Actualizar
router.put('/actualizarlaboratorio/:id', csrfProtection, laboratorio.actualizarLaboratorio);
// Eliminar
router.delete('/borrarlaboratorio/:id', csrfProtection, laboratorio.borrarLaboratorio);
// Formulario de búsqueda
router.get('/buscadorlaboratorio', csrfProtection, laboratorio.mostrarBuscar);
// Endpoint de Busqueda Automatica 
router.get('/buscarlaboratorio', csrfProtection, laboratorio.buscarLaboratorio);

// ---------------------------------------- Rutas de Lote ---------------------------------------
// Listar lotes
router.get("/lotes", lote.listar);
// Formulario nuevo
router.get('/nuevolote', csrfProtection, lote.mostrarNuevo);
// Crear
router.post('/crearlote', csrfProtection, lote.crearLote);
// Formulario edición
router.get('/editarlote/:id', csrfProtection, lote.editarLote);
// Endpoint de Actualizar
router.put('/actualizarlote/:id', csrfProtection, lote.actualizarLote);
// Eliminar
router.delete('/borrarlote/:id', csrfProtection, lote.borrarLote);
// Formulario de búsqueda de lotes
router.get('/buscardorlote', csrfProtection, lote.mostrarBuscar);
// Endpoint de búsqueda
router.get('/buscarlote', csrfProtection, lote.buscarLotes);

// ---------------------------------------- Rutas de Pacientes ---------------------------------------
// Listar pacientes
router.get("/pacientes", paciente.listar);
// Formulario nuevo paciente
router.get('/nuevopaciente', csrfProtection, paciente.mostrarNuevo);
// Crear paciente   
router.post('/crearpaciente', csrfProtection, paciente.crearPaciente);
// Formulario edición paciente
router.get('/editarpaciente/:id', csrfProtection, paciente.editarPaciente);
// Endpoint de Actualizar
router.put('/actualizarpaciente/:id', csrfProtection, paciente.actualizarPaciente);
// Eliminar
router.delete('/borrarpaciente/:id', csrfProtection, paciente.borrarPaciente);
// Formulario de búsqueda de pacientes
router.get('/buscadorpaciente', csrfProtection, paciente.mostrarBuscar);
// Endpoint de búsqueda
router.get('/buscarpaciente', csrfProtection, paciente.buscarPacientes);
// Endpoint de detalles de paciente
router.get('/detallespaciente/:id', csrfProtection, paciente.detallePaciente);

// ---------------------------------------- Rutas de Ubicaciones ---------------------------------------

// Listar ubicaciones
router.get("/ubicaciones", ubicacion.listar);
// Formulario nueva ubicación
router.get('/nuevoubicacion', csrfProtection, ubicacion.mostrarNuevo);
// Crear ubicación
router.post('/crearubicacion', csrfProtection, ubicacion.crearUbicacion);
// Formulario edición ubicación
router.get('/editarubicacion/:id', csrfProtection, ubicacion.editarUbicacion);
// Endpoint de Actualizar
router.put('/actualizarubicacion/:id', csrfProtection, ubicacion.actualizarUbicacion);
// Eliminar ubicación
router.delete('/borrarubicacion/:id', csrfProtection, ubicacion.borrarUbicacion);
// Formulario de búsqueda de ubicaciones
router.get('/buscadorubicacion', csrfProtection, ubicacion.mostrarBuscar);
// Endpoint de búsqueda de ubicaciones
router.get('/buscarubicacion', csrfProtection, ubicacion.buscarUbicacion);

// ---------------------------------------- Rutas de Movimientos ---------------------------------------

// Listar movimientos de lotes
router.get("/movimientos", movimientoLote.listar);
// Mostrar formulario de nuevo movimiento
router.get('/nuevomovimiento', csrfProtection, movimientoLote.mostrarNuevo);
// Crear movimiento
router.post('/crearmovimiento', csrfProtection, movimientoLote.crearMovimiento);

// ---------------------------------------- Rutas no encontradas y errores ---------------------------------------

// Manejo de rutas no encontradas
router.use(handler.error404);
// Manejo de errores
router.use(handler.error500);

module.exports = router;