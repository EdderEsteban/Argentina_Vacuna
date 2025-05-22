const router = require("express").Router();
const handler = require("./handler.js");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Rutas estaticas
router.get("/", (req, res) => {
  res.render("index");
});




// Manejo de rutas no encontradas
router.use((req, res, next) => {
  res.status(404).render("error404");
});

module.exports = router;