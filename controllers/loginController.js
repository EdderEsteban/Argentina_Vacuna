const passport = require('passport');
const bcryptjs = require('bcryptjs');
const { SolicitudesAcceso } = require('../models');

const loginController = {};

// Autenticar usuario con Passport y guardar datos de sesión (rol, ubicaciones)
loginController.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info?.message || 'Credenciales incorrectas' });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const ubicaciones = user.ubicaciones || [];
      req.session.usuario = {
        id: user.id,
        usuario: user.usuario,   
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        ubicaciones,
        ubicacionActual: ubicaciones.length === 1 ? ubicaciones[0] : null
      };

      const redirectTo = ubicaciones.length > 1 ? '/seleccionar-ubicacion' : '/dashboard';
      res.json({ success: true, message: `Bienvenido, ${user.nombre}`, redirectTo });
    });
  })(req, res, next);
};

// Mostrar pantalla de selección de ubicación activa para usuarios con múltiples asignaciones
loginController.seleccionarUbicacion = (req, res) => {
  if (!req.session?.usuario) return res.redirect('/');
  const { ubicaciones = [], ubicacionActual } = req.session.usuario;
  if (ubicaciones.length <= 1) {
    if (ubicaciones.length === 1) req.session.usuario.ubicacionActual = ubicaciones[0];
    return res.redirect('/dashboard');
  }
  res.render('seleccionarUbicacion', { ubicaciones, ubicacionActual });
};

// Guardar en sesión la ubicación elegida por el usuario y redirigir al dashboard
loginController.guardarUbicacion = (req, res) => {
  if (!req.session?.usuario) {
    return res.status(401).json({ success: false, message: 'Sesión expirada.' });
  }
  const { id_ubicacion } = req.body;
  const { ubicaciones = [] } = req.session.usuario;
  const ubi = ubicaciones.find(u => u.id == id_ubicacion);
  if (!ubi) {
    return res.status(400).json({ success: false, message: 'Ubicación no válida.' });
  }
  req.session.usuario.ubicacionActual = ubi;
  res.json({ success: true, redirectTo: '/dashboard' });
};

// Cerrar sesión de Passport y destruir los datos de sesión
loginController.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect('/'));
  });
};

// Mostrar formulario público para solicitar acceso al sistema
loginController.solicitud = (req, res) => {
  res.render('solicitud');
};

// Registrar una nueva solicitud de acceso pendiente en la base de datos
loginController.nuevaSolicitud = async (req, res) => {
  try {
    const { nombre, apellido, dni, correo, telefono, motivo, usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }
    const hashed = await bcryptjs.hash(password, 10);
    await SolicitudesAcceso.create({ nombre, apellido, dni, correo, telefono, motivo, usuario, password: hashed });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error al crear la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al crear la solicitud' });
  }
};

module.exports = loginController;
