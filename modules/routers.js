const router = require("express").Router();
const handler = require("./handler.js");
const laboratorio = require("../controllers/laboratorioController")
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

// ----------------------------------------  ---------------------------------------


// Manejo de rutas no encontradas
router.use(handler.error404);

module.exports = router;