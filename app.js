// Declaracion de Variables
const express = require ('express');
const path = require('path');
const app = express();
const morgan = require('morgan');

// Declaracion de Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
    res.send('Argentina Vacuna');
});

// Servidor
app.listen(3000, () => console.log('Server inicializado en http://localhost:3000'));