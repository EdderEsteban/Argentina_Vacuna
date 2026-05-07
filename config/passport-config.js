const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const { Usuario, UsuarioUbicacion, Rol, Ubicacion } = require('../models');

function buildUserPayload(user) {
  const primeraAsig = user.usuariosUbicacion?.[0];
  const rol = primeraAsig?.rol?.nombre || 'Sin rol';
  const ubicaciones = (user.usuariosUbicacion || []).map(uu => ({
    id: uu.id_ubicacion,
    nombre: uu.ubicacion?.nombre || '',
    tipo: uu.ubicacion?.tipo || ''
  }));
  return { id: user.id, usuario: user.usuario, nombre: user.nombre, apellido: user.apellido, rol, ubicaciones };
}

const includeUbicacionesConRol = [{
  model: UsuarioUbicacion,
  as: 'usuariosUbicacion',
  include: [
    { model: Rol, as: 'rol', attributes: ['nombre'] },
    { model: Ubicacion, as: 'ubicacion', attributes: ['id', 'nombre', 'tipo'] }
  ]
}];

passport.use(
  new LocalStrategy(
    { usernameField: 'usuario', passwordField: 'password' },
    async (usuario, password, done) => {
      try {
        const user = await Usuario.findOne({
          where: { usuario },
          include: includeUbicacionesConRol,
          attributes: { include: ['password'] }
        });

        if (!user) return done(null, false, { message: 'Usuario no encontrado' });

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Contraseña incorrecta' });

        return done(null, buildUserPayload(user));
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Usuario.findByPk(id, {
      include: includeUbicacionesConRol
    });
    if (!user) return done(null, false);
    done(null, buildUserPayload(user));
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
