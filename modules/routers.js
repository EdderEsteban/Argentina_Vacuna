const router = require("express").Router();
const handler = require("./handler.js");
const laboratorio = require("../controllers/laboratorioController")
const lote = require("../controllers/loteController");
const vacuna = require("../controllers/vacunaController");
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

// ---------------------------------------- Rutas de Vacunas ---------------------------------------
// Listar vacunas
router.get("/vacunas", vacuna.listar);
// Formulario nuevo
router.get('/nuevavacuna', csrfProtection, vacuna.mostrarNuevo);
// Crear
router.post('/crearvacuna', csrfProtection, vacuna.crearVacuna);
// Formulario edición
router.get('/editarvacuna/:id', csrfProtection, vacuna.editarVacuna);
// Endpoint de Actualizar
router.put('/actualizarvacuna/:id', csrfProtection, vacuna.actualizarVacuna);
// Eliminar
router.delete('/borrarvacuna/:id', csrfProtection, vacuna.borrarVacuna);
// Formulario de búsqueda
router.get('/buscadorvacuna', csrfProtection, vacuna.mostrarBuscar);
// Endpoint de búsqueda
router.get('/buscarvacuna', csrfProtection, vacuna.buscarVacunas);

// ---------------------------------------- Rutas de Movimientos ---------------------------------------



// Manejo de rutas no encontradas
router.use(handler.error404);

module.exports = router;