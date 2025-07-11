const handler = {};


// Rutas
handler.index = (req, res) => {
  res.render("index");
}

handler.error404 = (req, res, next) => {
  res.status(404).render("error404");
}

handler.error500 = (req, res, next) => {
  res.status(500).render("error500");
}

module.exports = handler;