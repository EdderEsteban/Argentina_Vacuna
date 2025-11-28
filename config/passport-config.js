const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const { Usuario, Rol } = require('../models');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'usuario',
      passwordField: 'password'
    },
    async (usuario, password, done) => {
      try {
        const user = await Usuario.findOne({
          where: { usuario },
          include: { model: Rol, as: 'rol' },
          attributes: { include: ['password'] } // ← incluye el hash
        });

        if (!user) return done(null, false, { message: 'Usuario no encontrado' });

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Contraseña incorrecta' });

        return done(null, {
          id: user.id,
          usuario: user.usuario, 
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol.nombre
        });
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
      include: { model: Rol, as: 'rol' }
    });

    if (!user) return done(null, false);

    done(null, {
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol.nombre
    });
  } catch (err) {
    done(err);
  }
});

module.exports = passport;