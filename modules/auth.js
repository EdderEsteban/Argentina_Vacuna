'use strict';

const ROLES = {
  ADMIN: 'Administrador',
  AUDITOR: 'Auditor',
  ENFERMERO: 'Enfermero',
  ADMINISTRATIVO: 'Administrativo'
};

// Verifica que el usuario tenga sesión activa
const isAuthenticated = (req, res, next) => {
  if (req.session?.usuario) return next();
  if (req.method !== 'GET') {
    return res.status(401).json({ success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' });
  }
  return res.redirect('/');
};

// Verifica que el usuario tenga alguno de los roles especificados
const hasRole = (...roles) => (req, res, next) => {
  if (!req.session?.usuario) {
    if (req.method !== 'GET') return res.status(401).json({ success: false, message: 'No autenticado.' });
    return res.redirect('/');
  }
  if (roles.includes(req.session.usuario.rol)) return next();
  if (req.method !== 'GET') {
    return res.status(403).json({ success: false, message: 'No tiene permisos para esta acción.' });
  }
  return res.status(403).render('error403', { usuario: req.session.usuario });
};

// Redirige a /seleccionar-ubicacion si el usuario tiene múltiples ubicaciones y aún no eligió una
const requireUbicacion = (req, res, next) => {
  if (!req.session?.usuario) return next();
  const { ubicaciones = [], ubicacionActual } = req.session.usuario;
  if (ubicaciones.length > 1 && !ubicacionActual) {
    if (req.method !== 'GET') {
      return res.status(403).json({ success: false, message: 'Seleccione una ubicación de trabajo primero.' });
    }
    return res.redirect('/seleccionar-ubicacion');
  }
  return next();
};

module.exports = { isAuthenticated, hasRole, ROLES, requireUbicacion };
