// Declaracion de Variables
const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // <-- Agregar esto
const csrf = require('csurf');
const router = require('./modules/routers');
const flash = require('express-flash');

// Configurar el motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Declaracion de Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); 

// Configurar sesiones
app.use(session({
  secret: 'veni q t pincho',   resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true en producción con HTTPS
}));

app.use(flash()); 

// CSRF 
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection); // 3. CSRF después de sesiones

// Pasar CSRF a todas las vistas
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Rutas
app.use(router); 

// Servidor
app.listen(3000, () => console.log('Server inicializado en http://localhost:3000'));