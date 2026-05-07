// test_profiles.js — prueba automatizada de rutas por perfil
const http = require('http');

const BASE = 'http://localhost:3000';

// ──────────────────────────────────────────────
// Helpers HTTP
// ──────────────────────────────────────────────

function parseSetCookies(headers) {
  const cookies = {};
  const raw = headers['set-cookie'] || [];
  raw.forEach(line => {
    const part = line.split(';')[0];
    const eq = part.indexOf('=');
    if (eq > 0) cookies[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  });
  return cookies;
}

function buildCookieHeader(cookies) {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

function request(method, url, { cookies = {}, body = null, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const allHeaders = { 'Cookie': buildCookieHeader(cookies), ...headers };
    let payload = null;
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      allHeaders['Content-Type'] = 'application/json';
      allHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const opts = { hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method, headers: allHeaders };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data, newCookies: parseSetCookies(res.headers) }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function extractCsrf(html) {
  const m = html.match(/name="csrf-token"\s+content="([^"]+)"/) ||
            html.match(/name="_csrf"\s+value="([^"]+)"/);
  return m ? m[1] : null;
}

// ──────────────────────────────────────────────
// Login — maneja respuesta JSON con redirectTo
// ──────────────────────────────────────────────
async function login(usuario, password) {
  // Primera GET para establecer la cookie _csrf
  const r1 = await request('GET', `${BASE}/`);
  let cookies = { ...r1.newCookies };

  // Segunda GET con la cookie ya establecida — token coincidirá con esa cookie
  const r2 = await request('GET', `${BASE}/`, { cookies });
  Object.assign(cookies, r2.newCookies);
  const csrfToken = extractCsrf(r2.body);
  if (!csrfToken) throw new Error(`No se encontró CSRF token en GET / (usuario: ${usuario})`);

  // POST /login → responde JSON { success, redirectTo }
  const loginRes = await request('POST', `${BASE}/login`, {
    cookies,
    body: { usuario, password, _csrf: csrfToken },
    headers: { 'X-CSRF-Token': csrfToken }
  });
  Object.assign(cookies, loginRes.newCookies);

  let loginData;
  try { loginData = JSON.parse(loginRes.body); } catch { loginData = {}; }

  if (loginRes.status !== 200 || !loginData.success) {
    throw new Error(`Login fallido (${loginRes.status}): ${loginData.message || loginRes.body.substring(0, 100)}`);
  }

  // Seguir redirectTo
  let redirectTo = loginData.redirectTo || '/dashboard';
  if (!redirectTo.startsWith('http')) redirectTo = BASE + redirectTo;

  if (redirectTo.includes('seleccionar-ubicacion')) {
    const selRes = await request('GET', redirectTo, { cookies });
    Object.assign(cookies, selRes.newCookies);

    const csrfSel = extractCsrf(selRes.body);
    const ubicMatch = selRes.body.match(/name="id_ubicacion"\s+value="(\d+)"/);
    const ubicId = ubicMatch ? ubicMatch[1] : null;
    if (!ubicId) throw new Error(`No se encontró id_ubicacion en seleccionarUbicacion (usuario: ${usuario})`);

    // POST /seleccionar-ubicacion → responde JSON { success, redirectTo }
    const postSel = await request('POST', `${BASE}/seleccionar-ubicacion`, {
      cookies,
      body: { id_ubicacion: ubicId, _csrf: csrfSel },
      headers: { 'X-CSRF-Token': csrfSel }
    });
    Object.assign(cookies, postSel.newCookies);

    let selData;
    try { selData = JSON.parse(postSel.body); } catch { selData = {}; }
    if (!selData.success) throw new Error(`Error al seleccionar ubicación: ${selData.message}`);

    // Ir al dashboard
    const dashUrl = BASE + (selData.redirectTo || '/dashboard');
    const dash = await request('GET', dashUrl, { cookies });
    Object.assign(cookies, dash.newCookies);
  } else {
    const dash = await request('GET', redirectTo, { cookies });
    Object.assign(cookies, dash.newCookies);
  }

  // Verificar que /dashboard responde 200
  const check = await request('GET', `${BASE}/dashboard`, { cookies });
  if (check.status !== 200 || check.body.includes('form') && check.body.includes('password')) {
    throw new Error(`No autenticado tras login (status: ${check.status})`);
  }

  return { cookies, csrfToken: extractCsrf(check.body) || csrfToken };
}

// ──────────────────────────────────────────────
// Probar una ruta GET
// ──────────────────────────────────────────────
async function testRoute(cookies, path) {
  try {
    const res = await request('GET', `${BASE}${path}`, { cookies });
    const ok = res.status === 200;
    const body200 = ok && !res.body.includes('ForbiddenError') && !res.body.includes('invalid csrf');
    return { path, status: res.status, ok: body200, error: body200 ? null : `status ${res.status}` };
  } catch (e) {
    return { path, status: 0, ok: false, error: e.message };
  }
}

async function testForbidden(cookies, path) {
  try {
    const res = await request('GET', `${BASE}${path}`, { cookies });
    const denied = [401, 403].includes(res.status) || res.status === 302;
    return { path, status: res.status, ok: denied, error: denied ? null : `esperaba 403, recibió ${res.status}` };
  } catch (e) {
    return { path, status: 0, ok: false, error: e.message };
  }
}

// ──────────────────────────────────────────────
// Rutas por perfil
// ──────────────────────────────────────────────
const ALLOWED = {
  ADMINISTRADOR: [
    '/dashboard',
    '/laboratorios', '/nuevolaboratorio',
    '/lotes', '/nuevolote',
    '/pacientes', '/nuevopaciente',
    '/ubicaciones', '/nuevoubicacion',
    '/usuarios', '/nuevousuario',
    '/movimientos', '/nuevomovimiento',
    '/aplicaciones',
    '/descartes', '/nuevodescarte',
    '/reportes', '/reportes/1', '/reportes/2', '/reportes/3', '/reportes/4', '/reportes/5', '/reportes/6',
    '/solicitudes',
  ],
  AUDITOR: [
    '/dashboard',
    '/laboratorios', '/lotes', '/pacientes', '/ubicaciones', '/movimientos',
    '/aplicaciones', '/descartes',
    '/reportes', '/reportes/1', '/reportes/2', '/reportes/3', '/reportes/4', '/reportes/5', '/reportes/6',
  ],
  ENFERMERO: [
    '/dashboard',
    '/lotes',
    '/pacientes', '/nuevopaciente',
    '/aplicaciones', '/nuevaaplicacion',
  ],
  ADMINISTRATIVO: [
    '/dashboard',
    '/reportes', '/reportes/1', '/reportes/2', '/reportes/3', '/reportes/4', '/reportes/5', '/reportes/6',
  ],
};

const FORBIDDEN_ROUTES = {
  AUDITOR: ['/usuarios', '/nuevousuario', '/nuevolaboratorio', '/nuevolote', '/nuevoubicacion', '/solicitudes'],
  ENFERMERO: ['/usuarios', '/laboratorios', '/ubicaciones', '/movimientos', '/descartes', '/reportes', '/solicitudes'],
  ADMINISTRATIVO: ['/usuarios', '/laboratorios', '/lotes', '/ubicaciones', '/movimientos', '/pacientes', '/aplicaciones', '/descartes', '/solicitudes'],
};

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const profiles = [
    { nombre: 'ADMINISTRADOR', usuario: 'Administrador', password: 'Administrador123' },
    { nombre: 'AUDITOR',       usuario: 'Auditor',       password: 'Administrador123' },
    { nombre: 'ENFERMERO',     usuario: 'Enfermero',     password: 'Administrador123' },
    { nombre: 'ADMINISTRATIVO',usuario: 'Administrativo',password: 'Administrador123' },
  ];

  const allResults = {};

  for (const profile of profiles) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  Perfil: ${profile.nombre}`);
    console.log(`${'═'.repeat(60)}`);

    let cookies;
    try {
      ({ cookies } = await login(profile.usuario, profile.password));
      console.log(`  ✅ Login exitoso\n`);
    } catch (e) {
      console.log(`  ❌ LOGIN FALLIDO: ${e.message}\n`);
      allResults[profile.nombre] = { loginOk: false, error: e.message };
      continue;
    }

    const results = [];

    for (const path of (ALLOWED[profile.nombre] || [])) {
      const r = await testRoute(cookies, path);
      console.log(`  ${r.ok ? '✅' : '❌'} ${r.status.toString().padEnd(3)} ${path}${r.error ? '  ← ' + r.error : ''}`);
      results.push(r);
    }

    const forbidden = FORBIDDEN_ROUTES[profile.nombre] || [];
    if (forbidden.length) {
      console.log(`\n  -- rutas denegadas --`);
      for (const path of forbidden) {
        const r = await testForbidden(cookies, path);
        console.log(`  ${r.ok ? '✅' : '❌'} ${r.status.toString().padEnd(3)} ${path}  ← ${r.ok ? 'denegado correctamente' : r.error}`);
        results.push({ ...r, forbidden: true });
      }
    }

    allResults[profile.nombre] = { loginOk: true, results };
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  RESUMEN`);
  console.log(`${'═'.repeat(60)}`);

  let totalFails = 0;
  for (const [nombre, data] of Object.entries(allResults)) {
    if (!data.loginOk) { console.log(`  ❌ ${nombre}: login fallido — ${data.error}`); totalFails++; continue; }
    const fails = data.results.filter(r => !r.ok);
    if (!fails.length) {
      console.log(`  ✅ ${nombre}: todas las rutas OK`);
    } else {
      console.log(`  ❌ ${nombre}: ${fails.length} falla(s)`);
      fails.forEach(f => console.log(`       ${f.forbidden ? '[denegada]' : '[acceso]'} ${f.path}: ${f.error}`));
      totalFails += fails.length;
    }
  }

  console.log(`\n  Total fallas: ${totalFails}\n`);
  process.exit(totalFails > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
