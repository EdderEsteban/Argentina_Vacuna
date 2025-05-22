// Declaracion de Variables
const express = require ('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const router = require('./modules/routers');

// Configurar el motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Declaracion de Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); // Configura el middleware de cookies
// Configura el middleware de CSRF para las solicitudes
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection); 

// Rutas
app.use(router);

// Servidor
app.listen(3000, () => console.log('Server inicializado en http://localhost:3000'));