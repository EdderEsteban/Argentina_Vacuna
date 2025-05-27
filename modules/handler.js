const handler = {};


// Rutas
handler.index = (req, res) => {
  res.render("index");
}

handler.error404 = (req, res, next) => {
  res.status(404).render("error404");
}

module.exports = handler;