const { Usuario, Rol, Ubicacion, UsuarioUbicacion } = require('../models');
const { Op } = require('sequelize');
const bcryptjs = require('bcryptjs');

const usuario = {};

// Listar usuarios con paginación y ubicaciones
usuario.listar = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await Usuario.findAndCountAll({
    include: [
      { model: Ubicacion, as: 'ubicaciones', through: { attributes: [] } }
    ],
    distinct: true,
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  res.render('usuarios/listadoUsuario', {
    usuarios: rows,
    pagination: { currentPage: page, totalPages: Math.ceil(count / limit) }
  });
};

// Consulta de roles para el modal
usuario.consultarRoles = async (req, res) => {
  const roles = await Rol.findAll({ order: [['nombre', 'ASC']] });
  res.json(roles);
};

// Obtener las ubicaciones actuales del usuario 
usuario.obtenerUbicaciones = async (req, res) => {
  try {

    const userId = req.params.id;

    // 1) Ubicaciones asignadas al usuario
    const user = await Usuario.findByPk(userId, {
      include: {
        model: Ubicacion,
        as: 'ubicaciones',
        through: { attributes: ['id_rol'] }
      }
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // 2) Todos los roles (para los <select>)
    const roles = await Rol.findAll({ raw: true });

    // 3) Mapear datos
    const data = user.ubicaciones.map(u => ({
      id: u.id,
      nombre: u.nombre,
      id_rol: u.UsuarioUbicacion.id_rol,
      rolNombre: roles.find(r => r.id === u.UsuarioUbicacion.id_rol)?.nombre || null
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener ubicaciones' });
  }
};



// Mostrar formulario de nuevo usuario
usuario.mostrarNuevo = async (req, res) => {
  const roles = await Rol.findAll({ order: [['nombre', 'ASC']] });
  const ubicaciones = await Ubicacion.findAll({ order: [['nombre', 'ASC']] });
  res.render('usuarios/nuevoUsuario', { roles, ubicaciones });
};

// Crear usuario + asignar ubicaciones (con roles)
usuario.crearUsuario = async (req, res) => {
  const { nombre, apellido, dni, correo, telefono, usuario, password, ubicaciones } = req.body;

  // Validar campos obligatorios
  const camposObligatorios = ['nombre', 'apellido', 'dni', 'usuario', 'password', 'correo', 'telefono'];
  for (const c of camposObligatorios) {
    if (!req.body[c] || !req.body[c].toString().trim()) {
      return res.status(400).json({ success: false, message: `El campo ${c} es obligatorio` });
    }
  }

  // Validar que haya al menos una ubicación
  if (!Array.isArray(ubicaciones) || !ubicaciones.length) {
    return res.status(400).json({ success: false, message: 'Debe asignar al menos una ubicación' });
  }

  try {
    // 1. Crear el usuario (sin id_rol)
    const hashed = await bcryptjs.hash(password, 10);
    const user = await Usuario.create({
      nombre,
      apellido,
      dni,
      correo,
      telefono,
      usuario,
      password: hashed
    });

    // 2. Insertar ubicaciones + roles
    if (ubicaciones && ubicaciones.length) {
      const data = ubicaciones.map(({ id_ubicacion, id_rol }) => ({
        id_usuario: user.id,
        id_ubicacion,
        id_rol
      }));
      await UsuarioUbicacion.bulkCreate(data);
    }

    res.status(201).json({ success: true, message: 'Usuario creado' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const campo = Object.keys(err.fields)[0];
      const msg = `El ${campo} ya está registrado`;
      return res.status(409).json({ success: false, message: msg });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

// Mostrar pantalla de edición
usuario.editarUsuario = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'apellido', 'dni', 'usuario', 'correo', 'telefono']
    });
    if (!user) return res.status(404).render('error404');

    // Ubicaciones asignadas + rol de cada una
    const efectores = await Ubicacion.findAll({
      include: [{
        model: UsuarioUbicacion,
        as: 'usuariosUbicacion',
        where: { id_usuario: user.id },
        attributes: ['id_rol'],
        include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }]
      }],
      order: [['nombre', 'ASC']]
    });

    const ubicaciones = await Ubicacion.findAll({ order: [['nombre', 'ASC']] });
    const roles       = await Rol.findAll({ order: [['nombre', 'ASC']] });

    res.render('usuarios/modificarUsuario', {
      user,
      efectores,   
      ubicaciones,
      roles,
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error(err);
    res.redirect('/500');
  }
};  

// Actualizar usuario (solo los campos enviados)
usuario.actualizarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Usuario.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const updates = {};
    const campos = ['nombre', 'apellido', 'dni', 'correo', 'telefono'];
    campos.forEach(c => { if (req.body[c] !== undefined) updates[c] = req.body[c]; });
    if (req.body.usuario !== undefined) updates.usuario = req.body.usuario;

    if (updates.dni) {
      const dniExistente = await Usuario.findOne({ where: { dni: updates.dni, id: { [Op.ne]: id } } });
      if (dniExistente) return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
    }
    if (updates.usuario) {
      const usuarioExistente = await Usuario.findOne({ where: { usuario: updates.usuario, id: { [Op.ne]: id } } });
      if (usuarioExistente) return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso' });
    }

    await user.update(updates);
    res.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
};

// Blanquear password
usuario.blanquearPassword = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const nuevaClave = "Argentina Vacuna 2026"//Math.random().toString(36).slice(-8);
    user.password = await bcryptjs.hash(nuevaClave, 10);
    await user.save();

    res.json({ success: true, message: `Contraseña blanqueada. Nueva clave: ${nuevaClave}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al blanquear' });
  }
}; 

// Sincronizar ubicaciones y roles del usuario.

usuario.actualizarUbicaciones = async (req, res) => {
  try {
    const userId = req.params.id;
    const raw = req.body;
    const ubicaciones = Array.isArray(raw) ? raw : raw?.ubicaciones;

    if (!Array.isArray(ubicaciones)) {
      return res.status(400).json({
        success: false,
        message: 'Se esperaba un array de ubicaciones (con id_ubicacion + id_rol).'
      });
    }

    for (const u of ubicaciones) {
      if (!u || !u.id_ubicacion || !u.id_rol) {
        return res.status(400).json({
          success: false,
          message: 'Cada ubicación debe incluir id_ubicacion y id_rol.'
        });
      }
    }

    // Eliminar todas las asignaciones actuales
    await UsuarioUbicacion.destroy({ where: { id_usuario: userId } });

    // Insertar las nuevas
    if (ubicaciones.length) {
      const data = ubicaciones.map(item => ({
        id_usuario: userId,
        id_ubicacion: item.id_ubicacion,
        id_rol: item.id_rol
      }));
      await UsuarioUbicacion.bulkCreate(data);
    }

    res.json({ success: true, message: 'Ubicaciones actualizadas', total: ubicaciones.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar ubicaciones' });
  }
};

// Eliminar usuario (soft delete)
usuario.borrarUsuario = async (req, res) => {
  await Usuario.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
};

// ─── Autogestión de cuenta (el usuario opera sobre SU PROPIO id de sesión) ───

// Mostrar la página "Mi cuenta" del usuario autenticado
usuario.miCuenta = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.session.usuario.id, {
      attributes: ['id', 'nombre', 'apellido', 'dni', 'usuario', 'correo', 'telefono'],
      include: [{ model: Ubicacion, as: 'ubicaciones', through: { attributes: ['id_rol'] } }]
    });
    if (!user) return res.redirect('/');

    const roles = await Rol.findAll({ raw: true });
    const efectores = user.ubicaciones.map(u => ({
      nombre: u.nombre,
      rol: roles.find(r => r.id === u.UsuarioUbicacion.id_rol)?.nombre || '—'
    }));

    res.render('usuarios/miCuenta', { cuenta: user, efectores });
  } catch (err) {
    console.error('Error al cargar mi cuenta:', err);
    res.redirect('/500');
  }
};

// Actualizar MIS datos de contacto (solo correo y teléfono del usuario de sesión)
usuario.actualizarMiCuenta = async (req, res) => {
  try {
    const id = req.session.usuario.id;
    const { correo, telefono } = req.body;

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ success: false, message: 'Ingresá un correo electrónico válido.' });
    }
    if (telefono && !/^\+?\d{7,15}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: 'Formato de teléfono inválido (7 a 15 dígitos).' });
    }

    const correoExistente = await Usuario.findOne({ where: { correo, id: { [Op.ne]: id } } });
    if (correoExistente) {
      return res.status(409).json({ success: false, message: 'Ese correo ya está registrado por otro usuario.' });
    }

    const user = await Usuario.findByPk(id);
    await user.update({ correo, telefono });
    res.json({ success: true, message: 'Tus datos de contacto fueron actualizados.' });
  } catch (err) {
    console.error('Error al actualizar mi cuenta:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar tus datos.' });
  }
};

// Cambiar MI propia contraseña (valida la actual; opera solo sobre el id de sesión)
usuario.cambiarMiPassword = async (req, res) => {
  try {
    const id = req.session.usuario.id;
    const { actual, nueva, confirmar } = req.body;

    if (!actual || !nueva || !confirmar) {
      return res.status(400).json({ success: false, message: 'Completá todos los campos.' });
    }
    if (nueva.length < 8) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    if (nueva !== confirmar) {
      return res.status(400).json({ success: false, message: 'La confirmación no coincide con la nueva contraseña.' });
    }

    const user = await Usuario.findByPk(id, { attributes: { include: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    const coincide = await bcryptjs.compare(actual, user.password);
    if (!coincide) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta.' });
    }
    if (await bcryptjs.compare(nueva, user.password)) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña no puede ser igual a la actual.' });
    }

    user.password = await bcryptjs.hash(nueva, 10);
    await user.save();
    res.json({ success: true, message: 'Tu contraseña fue actualizada correctamente.' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ success: false, message: 'Error al cambiar la contraseña.' });
  }
};

module.exports = usuario;