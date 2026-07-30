'use strict';

// Módulo de permisos: qué puede ver y qué puede hacer cada usuario según su rol
// y el nivel de su ubicación activa

const { Ubicacion } = require('../models');
const { Op } = require('sequelize');

const NIVEL = { NACIONAL: 'nacional', PROVINCIAL: 'provincial', CENTRO: 'centro' };

// Función para obtener el nivel de una ubicación según su tipo
function nivelDe(ubicacion) {
  if (!ubicacion) return NIVEL.CENTRO;
  if (ubicacion.tipo === 'Deposito Nacional') return NIVEL.NACIONAL;
  if (ubicacion.tipo === 'Deposito Provincial') return NIVEL.PROVINCIAL;
  return NIVEL.CENTRO;
}

// Función para calcular las capacidades de acción según rol y nivel de ubicación
function capacidades(sessionUser = {}) {
  const rol = sessionUser.rol;
  const nivel = nivelDe(sessionUser.ubicacionActual);
  const cap = (o) => ({
    rol, nivel,
    gestionar: false, distribuir: false, recibir: false,
    descartar: false, vacunar: false, soloLectura: false,
    ...o
  });

  if (rol === 'Administrador') {
    return cap({ nivel: NIVEL.NACIONAL, gestionar: true, distribuir: true, recibir: true, descartar: true });
  }
  if (rol === 'Auditor') {
    return cap({ soloLectura: true });
  }
  if (rol === 'Enfermero') {
    return cap({ descartar: true, vacunar: true });
  }
  if (rol === 'Administrativo') {
    if (nivel === NIVEL.NACIONAL)   return cap({ gestionar: true, distribuir: true, descartar: true });
    if (nivel === NIVEL.PROVINCIAL) return cap({ distribuir: true, recibir: true, descartar: true });
    return cap({ descartar: true });
  }
  return cap({ soloLectura: true });
}

// Función para obtener el alcance de datos del usuario (país, provincia o ubicación)
function alcanceDatos(sessionUser = {}) {
  const rol = sessionUser.rol;
  const ubi = sessionUser.ubicacionActual || null;
  const nivel = nivelDe(ubi);

  if (rol === 'Administrador' || nivel === NIVEL.NACIONAL) {
    return { nivel: NIVEL.NACIONAL, global: true, idUbicacion: null, idProvincia: null };
  }
  if (nivel === NIVEL.PROVINCIAL) {
    return { nivel: NIVEL.PROVINCIAL, global: false, idUbicacion: null, idProvincia: ubi?.id_provincia ?? null };
  }
  return { nivel: NIVEL.CENTRO, global: false, idUbicacion: ubi?.id ?? null, idProvincia: ubi?.id_provincia ?? null };
}

// Función para listar los id_ubicacion dentro del alcance del usuario
async function idsEnScope(sessionUser = {}) {
  const a = alcanceDatos(sessionUser);
  if (a.global) return null;
  if (a.nivel === NIVEL.CENTRO) return a.idUbicacion != null ? [a.idUbicacion] : [];
  if (a.idProvincia == null) return [];
  // Depósitos provinciales y centros de la provincia, sin el Depósito Nacional
  const ubis = await Ubicacion.findAll({
    where: { id_provincia: a.idProvincia, tipo: { [Op.ne]: 'Deposito Nacional' } },
    attributes: ['id']
  });
  return ubis.map(u => u.id);
}

// Middleware para exigir que el usuario tenga las capacidades indicadas
function exigir(...flags) {
  return (req, res, next) => {
    const caps = capacidades(req.session?.usuario || {});
    const ok = flags.every(f => caps[f]);
    if (ok) return next();
    if (req.method !== 'GET') {
      return res.status(403).json({ success: false, message: 'No tiene permisos para esta acción.' });
    }
    return res.status(403).render('error403', { usuario: req.session?.usuario });
  };
}

module.exports = { NIVEL, nivelDe, capacidades, alcanceDatos, idsEnScope, exigir };
