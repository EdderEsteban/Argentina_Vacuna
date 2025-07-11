const router = require("express").Router();
const handler = require("./handler.js");
const laboratorio = require("../controllers/laboratorioController")
const lote = require("../controllers/loteController");
const paciente = require("../controllers/pacienteController");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Rutas estaticas
router.get("/", handler.index);

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



// ---------------------------------------- Rutas de Movimientos ---------------------------------------



// Manejo de rutas no encontradas
router.use(handler.error404);

module.exports = router;