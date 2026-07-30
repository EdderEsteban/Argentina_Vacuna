'use strict';

// Módulo de alcance de datos: acota reportes y listados a la ubicación activa
// del usuario. El Nivel Central (Depósito Nacional) ve todo el país.

// Función para saber si una ubicación es Nivel Central
function esNivelCentral(ubicacion) {
  return !!ubicacion && ubicacion.tipo === 'Deposito Nacional';
}

// Función para obtener el alcance según la ubicación activa del usuario
function alcanceUbicacion(sessionUser = {}) {
  const { ubicacionActual = null, ubicaciones = [] } = sessionUser;
  if (esNivelCentral(ubicacionActual)) {
    return { global: true, idUbicacion: null };
  }
  const idUbicacion = ubicacionActual?.id ?? ubicaciones[0]?.id ?? null;
  return { global: false, idUbicacion };
}

// Función para armar el WHERE de Sequelize que acota por ubicación
function whereUbicacion(sessionUser, campo = 'id_ubicacion') {
  const { global, idUbicacion } = alcanceUbicacion(sessionUser);
  if (global) return {};
  return { [campo]: idUbicacion };
}

module.exports = { alcanceUbicacion, esNivelCentral, whereUbicacion };
