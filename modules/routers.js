const router = require('express').Router();
const handler = require('./handler.js');
const { isAuthenticated: auth, hasRole, ROLES, requireUbicacion } = require('./auth');
const { exigir } = require('./permisos');
const laboratorio = require('../controllers/laboratorioController');
const lote = require('../controllers/loteController');
const paciente = require('../controllers/pacienteController');
const ubicacion = require('../controllers/ubicacionController');
const movimientoLote = require('../controllers/movimientoLoteController');
const loginController = require('../controllers/loginController');
const dashboardCtrl = require('../controllers/dashboardController');
const usuarios = require('../controllers/usuarioController');
const aplicacion = require('../controllers/aplicacionController');
const descarteCtrl = require('../controllers/descarteController');
const reporteCtrl = require('../controllers/reporteController');
const solicitudesCtrl = require('../controllers/solicitudesController');
const transporteCtrl  = require('../controllers/transporteController');
const { ADMIN, AUDITOR, ENFERMERO, ADMINISTRATIVO } = ROLES;

// ─── Accesos por grupo de roles ──────────────────────────────────────────────
const soloAdmin        = [auth, hasRole(ADMIN)];
const soloEnfermero    = [auth, hasRole(ENFERMERO)];
const adminAdm         = [auth, hasRole(ADMIN, ADMINISTRATIVO)];
const adminAuditor     = [auth, hasRole(ADMIN, AUDITOR)];
const adminEnfermero   = [auth, hasRole(ADMIN, ENFERMERO)];
const adminAuditorEnf  = [auth, hasRole(ADMIN, AUDITOR, ENFERMERO)];
const adminAuditorAdm  = [auth, hasRole(ADMIN, AUDITOR, ADMINISTRATIVO)];
const adminAdmEnf      = [auth, hasRole(ADMIN, ADMINISTRATIVO, ENFERMERO)];
const reportes         = [auth, hasRole(ADMIN, AUDITOR, ADMINISTRATIVO, ENFERMERO)];
const todoAutenticado  = [auth, hasRole(ADMIN, AUDITOR, ENFERMERO, ADMINISTRATIVO)];

// ─── Capacidades de acción por rol y nivel de ubicación ──────────────────────
const puedeGestionar   = [auth, exigir('gestionar')];   // CRUD de catálogos
const puedeDistribuir  = [auth, exigir('distribuir')];  // crear movimientos
const puedeRecibir     = [auth, exigir('recibir')];     // registrar recepción
const puedeDescartar   = [auth, exigir('descartar')];   // registrar descartes
const puedeVacunar     = [auth, exigir('vacunar')];     // aplicar vacuna

// ─── Middleware global: fuerza selección de ubicación si corresponde ──────────
const RUTAS_PUBLICAS = ['/', '/login', '/solicitud', '/nuevaSolicitud', '/logout', '/seleccionar-ubicacion'];
router.use((req, res, next) => {
  if (RUTAS_PUBLICAS.includes(req.path)) return next();
  return requireUbicacion(req, res, next);
});

// ─── Rutas públicas ───────────────────────────────────────────────────────────
router.get('/', handler.index);
router.post('/login', loginController.login);
router.get('/solicitud', loginController.solicitud);
router.post('/nuevaSolicitud', loginController.nuevaSolicitud);

// ─── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', auth, loginController.logout);

// ─── Selección de ubicación ───────────────────────────────────────────────────
router.get('/seleccionar-ubicacion', auth, loginController.seleccionarUbicacion);
router.post('/seleccionar-ubicacion', auth, loginController.guardarUbicacion);

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get('/dashboard', ...todoAutenticado, dashboardCtrl.index);

// ─── Mi cuenta (autogestión: cualquier usuario autenticado sobre su propio id) ─
router.get('/mi-cuenta',           ...todoAutenticado, usuarios.miCuenta);
router.put('/mi-cuenta',           ...todoAutenticado, usuarios.actualizarMiCuenta);
router.put('/mi-cuenta/password',  ...todoAutenticado, usuarios.cambiarMiPassword);

// ─── Usuarios (solo Admin) ───────────────────────────────────────────────────
router.get('/usuarios',                   ...soloAdmin, usuarios.listar);
router.get('/nuevoUsuario',               ...soloAdmin, usuarios.mostrarNuevo);
router.post('/crearUsuario',              ...soloAdmin, usuarios.crearUsuario);
router.get('/editarUsuario/:id',          ...soloAdmin, usuarios.editarUsuario);
router.get('/usuarios/:id/ubicaciones',   ...soloAdmin, usuarios.obtenerUbicaciones);
router.put('/usuarios/:id/ubicaciones',   ...soloAdmin, usuarios.actualizarUbicaciones);
router.post('/usuarios/:id/blanquear',    ...soloAdmin, usuarios.blanquearPassword);
router.get('/roles',                      ...soloAdmin, usuarios.consultarRoles);
router.put('/actualizarUsuario/:id',      ...soloAdmin, usuarios.actualizarUsuario);
router.delete('/borrarUsuario/:id',       ...soloAdmin, usuarios.borrarUsuario);

// ─── Laboratorios ─────────────────────────────────────────────────────────────
router.get('/laboratorios',               ...adminAuditorAdm, laboratorio.listar);
router.get('/nuevolaboratorio',           ...puedeGestionar, laboratorio.mostrarNuevo);
router.post('/crearlaboratorio',          ...puedeGestionar, laboratorio.crearLaboratorio);
router.get('/editarlaboratorio/:id',      ...puedeGestionar, laboratorio.editarLaboratorio);
router.put('/actualizarlaboratorio/:id',  ...puedeGestionar, laboratorio.actualizarLaboratorio);
router.delete('/borrarlaboratorio/:id',   ...puedeGestionar, laboratorio.borrarLaboratorio);
router.get('/buscadorlaboratorio',        ...adminAuditorAdm, laboratorio.mostrarBuscar);
router.get('/buscarlaboratorio',          ...adminAuditorAdm, laboratorio.buscarLaboratorio);

// ─── Lotes ────────────────────────────────────────────────────────────────────
router.get('/lotes',                      ...todoAutenticado, lote.listar);
router.get('/nuevolote',                  ...puedeGestionar, lote.mostrarNuevo);
router.post('/crearlote',                 ...puedeGestionar, lote.crearLote);
router.get('/editarlote/:id',             ...puedeGestionar, lote.editarLote);
router.put('/actualizarlote/:id',         ...puedeGestionar, lote.actualizarLote);
router.delete('/borrarlote/:id',          ...puedeGestionar, lote.borrarLote);
router.get('/buscardorlote',              ...todoAutenticado, lote.mostrarBuscar);
router.get('/buscarlote',                 ...todoAutenticado, lote.buscarLotes);

// ─── Pacientes ────────────────────────────────────────────────────────────────
router.get('/pacientes',                  ...adminAuditorEnf, paciente.listar);
router.get('/nuevopaciente',              ...adminEnfermero, paciente.mostrarNuevo);
router.post('/crearpaciente',             ...adminEnfermero, paciente.crearPaciente);
router.get('/editarpaciente/:id',         ...adminEnfermero, paciente.editarPaciente);
router.put('/actualizarpaciente/:id',     ...adminEnfermero, paciente.actualizarPaciente);
router.delete('/borrarpaciente/:id',      ...soloAdmin, paciente.borrarPaciente);
router.get('/buscadorpaciente',           ...adminAuditorEnf, paciente.mostrarBuscar);
router.get('/buscarpaciente',             ...adminAuditorEnf, paciente.buscarPacientes);
router.get('/detallespaciente/:id',       ...adminAuditorEnf, paciente.detallePaciente);

// ─── Ubicaciones ──────────────────────────────────────────────────────────────
router.get('/ubicaciones',                ...adminAuditor, ubicacion.listar);
router.get('/nuevoubicacion',             ...puedeGestionar, ubicacion.mostrarNuevo);
router.post('/crearubicacion',            ...puedeGestionar, ubicacion.crearUbicacion);
router.get('/editarubicacion/:id',        ...puedeGestionar, ubicacion.editarUbicacion);
router.put('/actualizarubicacion/:id',    ...puedeGestionar, ubicacion.actualizarUbicacion);
router.delete('/borrarubicacion/:id',     ...puedeGestionar, ubicacion.borrarUbicacion);
router.get('/buscadorubicacion',          ...adminAuditor, ubicacion.mostrarBuscar);
router.get('/buscarubicacion',            ...adminAuditor, ubicacion.buscarUbicacion);

// ─── Movimientos ──────────────────────────────────────────────────────────────
router.get('/movimientos',                ...todoAutenticado, movimientoLote.listar);
router.get('/nuevomovimiento',            ...puedeDistribuir, movimientoLote.mostrarNuevo);
router.post('/crearmovimiento',           ...puedeDistribuir, movimientoLote.crearMovimiento);
router.put('/movimientos/:id/recepcion',  ...puedeRecibir, movimientoLote.registrarRecepcion);

// ─── Transportes ──────────────────────────────────────────────────────────────
router.get('/transportes',                ...adminAuditorAdm, transporteCtrl.listar);
router.get('/nuevotransporte',            ...puedeGestionar, transporteCtrl.mostrarNuevo);
router.post('/creartransporte',           ...puedeGestionar, transporteCtrl.crearTransporte);
router.delete('/borrartransporte/:id',    ...puedeGestionar, transporteCtrl.borrarTransporte);

// ─── Aplicaciones ─────────────────────────────────────────────────────────────
router.get('/aplicaciones',               ...adminAuditorEnf, aplicacion.listar);
router.get('/nuevaaplicacion',            ...puedeVacunar, aplicacion.mostrarNuevo);
router.post('/crearaplicacion',           ...puedeVacunar, aplicacion.crearAplicacion);
router.get('/aplicaciones/ubicaciones/:id_lote',   ...puedeVacunar, aplicacion.ubicacionesPorLote);
router.get('/aplicaciones/buscar-paciente',        ...puedeVacunar, aplicacion.buscarPacientePorDni);
router.get('/buscadoraplicacion',         ...adminAuditorEnf, aplicacion.mostrarBuscar);
router.get('/buscaraplicacion',           ...adminAuditorEnf, aplicacion.buscarAplicaciones);

// ─── Descartes ────────────────────────────────────────────────────────────────
router.get('/descartes',                  ...adminAuditor, descarteCtrl.listar);
router.get('/nuevodescarte',              ...puedeDescartar, descarteCtrl.mostrarNuevo);
router.post('/creardescarte',             ...puedeDescartar, descarteCtrl.crearDescarte);
router.get('/descartes/ubicaciones/:id_lote',      ...puedeDescartar, descarteCtrl.ubicacionesPorLote);

// ─── Solicitudes de Acceso ────────────────────────────────────────────────────
router.get('/solicitudes',             ...soloAdmin, solicitudesCtrl.listar);
router.put('/solicitudes/:id/estado',  ...soloAdmin, solicitudesCtrl.actualizarEstado);

// ─── Reportes ─────────────────────────────────────────────────────────────────
router.get('/reportes',   ...reportes, reporteCtrl.index);
router.get('/reportes/1', ...reportes, reporteCtrl.reporte1);
router.get('/reportes/2', ...reportes, reporteCtrl.reporte2);
router.get('/reportes/3', ...reportes, reporteCtrl.reporte3);
router.get('/reportes/4', ...reportes, reporteCtrl.reporte4);
router.get('/reportes/5', ...reportes, reporteCtrl.reporte5);
router.get('/reportes/6', ...reportes, reporteCtrl.reporte6);

// ─── Páginas de error explícitas ─────────────────────────────────────────────
router.get('/400', handler.error400);
router.get('/401', handler.error401);
router.get('/403', handler.error403);
router.get('/500', (req, res) => res.status(500).render('error500'));

// ─── Rutas no encontradas y errores ──────────────────────────────────────────
router.use(handler.error404);

module.exports = router;
