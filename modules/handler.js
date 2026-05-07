const handler = {};

handler.index = (req, res) => {
  res.render('index');
};

handler.error400 = (req, res) => {
  res.status(400).render('error400');
};

handler.error401 = (req, res) => {
  res.status(401).render('error401');
};

handler.error403 = (req, res) => {
  res.status(403).render('error403');
};

handler.error404 = (req, res) => {
  res.status(404).render('error404');
};

// Express reconoce un error handler por tener exactamente 4 parámetros
handler.error500 = (err, req, res, next) => {
  console.error(err);
  res.status(500).render('error500');
};

module.exports = handler;
