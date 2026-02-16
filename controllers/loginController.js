const passport = require('passport');
const { SolicitudesAcceso } = require("../models");

const loginController = {};

loginController.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Credenciales incorrectas' });
    }

    req.logIn(user, (err) => {
      if (err) return next(err); 

      // Guardar en sesión
      req.session.usuario = { 
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      };

      res.json({ success: true });
    });
  })(req, res, next);
};

loginController.dashboard = (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }  
  res.render('dashboard', { usuario: req.user }); 
}; 

loginController.solicitud = (req, res) => {
  res.render('solicitud');
};

loginController.nuevaSolicitud = async (req, res) => {
  try {
    const { nombre, apellido, dni, correo, telefono, motivo } = req.body;
    await SolicitudesAcceso.create({ nombre, apellido, dni, correo, telefono, motivo });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ success: false, message: "Error al crear la solicitud" });
  }
};

module.exports = loginController;