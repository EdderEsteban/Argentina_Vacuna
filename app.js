// Declaración de Variables
const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const router = require('./modules/routers');
const passport = require('./config/passport-config');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models');

// Configurar el motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Declaración de Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Configurar sesiones 
// (Muy importante para guardar la sesión del usuario en la base de datos y no en memoria)
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: 'colgate de esta',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Recordar cambiar a true en producción con HTTPS
    maxAge: 1000 * 60 * 30,  // 30 minutos de expiración de la sesión 
    rolling: true // Resetear el tiempo de expiración con cada petición
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// CSRF
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Pasar CSRF a todas las vistas
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Rutas
app.use(router);

// Servidor
app.listen(3000, () => console.log('Server inicializado en http://localhost:3000'));