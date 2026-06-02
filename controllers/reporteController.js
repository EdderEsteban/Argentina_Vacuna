const { sequelize } = require('../models');

const reporte = {};

// Normaliza el resultado de CALL según el driver/BD
function extractRows(raw) {
  if (!Array.isArray(raw[0])) return raw;
  if (Array.isArray(raw[0][0])) return raw[0][0];
  return raw[0].filter(r => r && typeof r === 'object' && !('affectedRows' in r));
}

// Determina el alcance de visualización del usuario:
//  - esNC: si el usuario ve datos a nivel nacional (Admin o ubicacionActual de tipo Deposito Nacional)
//  - ubicacionSeleccionada: id de la ubicación cuando hay que filtrar; null si ve todo
//  - mostrarSelector: si la vista debe mostrar el dropdown
//  - ubicacionesDisponibles: lista de ubicaciones del usuario para el selector
function getAlcance(req) {
  const usuario = req.session.usuario;
  const ubicacionActual = usuario.ubicacionActual || null;
  const ubicaciones = (usuario.ubicaciones || []).map(u => ({
    id: u.id, nombre: u.nombre, tipo: u.tipo
  }));
  const qsId = req.query.ubicacion ? parseInt(req.query.ubicacion, 10) : null;

  // Administrador: ve todo. Opcionalmente puede filtrar pasando ?ubicacion=
  if (usuario.rol === 'Administrador') {
    return {
      esNC: true,
      esAdmin: true,
      ubicacionSeleccionada: Number.isInteger(qsId) ? qsId : null,
      mostrarSelector: false,
      ubicacionesDisponibles: ubicaciones
    };
  }

  // Nivel Central: ve todo, no se filtra
  if (ubicacionActual && ubicacionActual.tipo === 'Deposito Nacional') {
    return {
      esNC: true,
      esAdmin: false,
      ubicacionSeleccionada: null,
      mostrarSelector: false,
      ubicacionesDisponibles: ubicaciones
    };
  }

  // No NC: filtra siempre por una ubicación
  let idSel;
  if (ubicaciones.length <= 1) {
    idSel = ubicaciones[0]?.id ?? ubicacionActual?.id ?? null;
    return {
      esNC: false,
      esAdmin: false,
      ubicacionSeleccionada: idSel,
      mostrarSelector: false,
      ubicacionesDisponibles: ubicaciones
    };
  }

  // Múltiples ubicaciones: validar ?ubicacion= o usar ubicacionActual como default
  const esValida = ubicaciones.some(u => u.id === qsId);
  idSel = esValida ? qsId : (ubicacionActual?.id ?? ubicaciones[0].id);
  return {
    esNC: false,
    esAdmin: false,
    ubicacionSeleccionada: idSel,
    mostrarSelector: true,
    ubicacionesDisponibles: ubicaciones
  };
}

// Construye un query string para preservar el filtro en links de la vista
function paramUbicacion(alcance) {
  return alcance.ubicacionSeleccionada
    ? `&ubicacion=${alcance.ubicacionSeleccionada}`
    : '';
}

// Index — renderiza el hub de reportes con flags de visibilidad por rol/ubicación
reporte.index = (req, res) => {
  const alcance = getAlcance(req);
  // Reporte 3 (Stock por Ubicación): si NO es NC y rol === Administrativo → ocultar
  const esAdministrativo = req.session.usuario.rol === 'Administrativo';
  const mostrarReporte3 = alcance.esNC || !esAdministrativo;
  res.render('reportes/index', {
    alcance,
    mostrarReporte3
  });
};

// Reporte 1: Compras por laboratorio (con filtro de fechas y ubicación)
reporte.reporte1 = async (req, res) => {
  const alcance = getAlcance(req);
  const { fecha_desde, fecha_hasta } = req.query;
  let resultados = null;

  if (fecha_desde && fecha_hasta) {
    try {
      const raw = await sequelize.query(
        'CALL sp_reporte1_compras_por_laboratorio(:desde, :hasta, :ubic)',
        { replacements: {
            desde: fecha_desde,
            hasta: fecha_hasta,
            ubic: alcance.ubicacionSeleccionada
          } }
      );
      resultados = extractRows(raw);
    } catch (error) {
      console.error('Error reporte 1:', error.message);
      resultados = [];
    }
  }

  res.render('reportes/reporte1', {
    resultados,
    fecha_desde: fecha_desde || '',
    fecha_hasta: fecha_hasta || '',
    alcance,
    paramUbicacion: paramUbicacion(alcance)
  });
};

// Reporte 2: Lotes por tipo de vacuna
reporte.reporte2 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte2_lotes_por_tipo(:ubic)',
      { replacements: { ubic: alcance.ubicacionSeleccionada } }
    );
    res.render('reportes/reporte2', {
      resultados: extractRows(raw),
      alcance
    });
  } catch (error) {
    console.error('Error reporte 2:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 3: Stock por (provincia | ubicación)
reporte.reporte3 = async (req, res) => {
  const alcance = getAlcance(req);
  // Bloqueo: Administrativo no-NC no puede ver este reporte
  if (!alcance.esNC && req.session.usuario.rol === 'Administrativo') {
    return res.redirect('/403');
  }
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte3_stock_por_provincia(:ubic)',
      { replacements: { ubic: alcance.ubicacionSeleccionada } }
    );
    res.render('reportes/reporte3', {
      resultados: extractRows(raw),
      alcance
    });
  } catch (error) {
    console.error('Error reporte 3:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 4: Personas a las que se aplicó vacuna vencida
reporte.reporte4 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte4_vacunados_vencidas(:ubic)',
      { replacements: { ubic: alcance.ubicacionSeleccionada } }
    );
    res.render('reportes/reporte4', {
      resultados: extractRows(raw),
      alcance
    });
  } catch (error) {
    console.error('Error reporte 4:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 5: Vacunas vencidas no descartadas
reporte.reporte5 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte5_vencidas_no_descartadas(:ubic)',
      { replacements: { ubic: alcance.ubicacionSeleccionada } }
    );
    res.render('reportes/reporte5', {
      resultados: extractRows(raw),
      alcance
    });
  } catch (error) {
    console.error('Error reporte 5:', error.message);
    res.status(500).render('error500');
  }
};

// Reporte 6: Personas vacunadas
reporte.reporte6 = async (req, res) => {
  const alcance = getAlcance(req);
  try {
    const raw = await sequelize.query(
      'CALL sp_reporte6_personas_vacunadas(:ubic)',
      { replacements: { ubic: alcance.ubicacionSeleccionada } }
    );
    res.render('reportes/reporte6', {
      resultados: extractRows(raw),
      alcance
    });
  } catch (error) {
    console.error('Error reporte 6:', error.message);
    res.status(500).render('error500');
  }
};

module.exports = reporte;
