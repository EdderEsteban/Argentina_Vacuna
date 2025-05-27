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
router.get('/nuevolaboratorio', laboratorio.mostrarNuevo);
// Crear
router.post('/crearlaboratorio', laboratorio.crearLaboratorio);
// Formulario edición
router.get('/editarlaboratorio/:id', laboratorio.editarLaboratorio);
// Actualizar
router.post('/actualizarlaboratorio/:id', laboratorio.actualizarLaboratorio);
// Eliminar
router.post('/borrarlaboratorio/:id', laboratorio.eliminarLaboratorio);

// ----------------------------------------  ---------------------------------------


// Manejo de rutas no encontradas
router.use(handler.error404);

module.exports = router;