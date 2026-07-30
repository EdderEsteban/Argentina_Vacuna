# Argentina Vacuna

> Sistema web de trazabilidad de vacunas — desde la compra al Ministerio de Salud hasta la aplicación a cada paciente.

Proyecto académico para la materia **Laboratorio de Programación II** (Tecnicatura Universitaria en Desarrollo Web).

---

## Descripción

`Argentina Vacuna` permite registrar y seguir cada dosis de vacuna a lo largo de su ciclo de vida:

1. El **Depósito Nacional** compra lotes a laboratorios proveedores y los almacena.
2. Despacha las dosis a los **Depósitos Provinciales** mediante movimientos con transporte asociado.
3. Cada provincia redistribuye a los **Centros de Vacunación** asignados.
4. Los **Enfermeros** aplican las vacunas a los pacientes y registran cada aplicación.
5. En cualquier punto se pueden registrar **descartes** por mal estado o vencimiento.
6. El sistema marca automáticamente como vencidas las dosis que superan su fecha de vencimiento.

El sistema diferencia cuatro roles (Administrador, Auditor, Enfermero, Administrativo) con permisos diferenciados por ubicación e implementa los seis reportes obligatorios del enunciado como Stored Procedures en MySQL.

---

## Stack

- **Backend**: Node.js 18+ · Express 4
- **ORM**: Sequelize 6 con Migrations
- **Base de Datos**: MySQL / MariaDB (vía phpMyAdmin)
- **Templating**: Pug
- **Frontend**: Bootstrap 5.3 · Select2 · SweetAlert2 · jQuery · Bootstrap Icons · Inter font
- **Auth**: Passport.js (estrategia local) · express-session · connect-session-sequelize
- **Seguridad**: csurf (CSRF tokens) · bcryptjs
- **Dev**: nodemon

---

## Requisitos previos

- Node.js 18 o superior
- npm
- MariaDB o MySQL 8 corriendo en `127.0.0.1:3306`
- phpMyAdmin (recomendado para administrar la BD)

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/EdderEsteban/Argentina_Vacuna.git
cd Argentina_Vacuna
npm install
```

### 2. Importar la base de datos

El repositorio incluye un dump completo (`argentina_vacuna.sql`) con el **esquema, los Stored Procedures, Triggers, Functions, el Event de vencimientos y todos los datos de prueba** (usuarios, ubicaciones, lotes y pacientes de ejemplo).

Desde **phpMyAdmin** → pestaña **Importar** → seleccionar `argentina_vacuna.sql` → **Continuar**.

> Esto crea la base `argentina_vacuna` ya poblada y lista para usar. **No** hace falta ejecutar migraciones ni seeders.

La conexión ya viene configurada en `config/config.json` para un MySQL local (`root` sin contraseña en `127.0.0.1:3306`). Si tu MySQL usa otras credenciales, ajustalas ahí.

### 3. Activar el event scheduler de MySQL

Una sola vez, desde phpMyAdmin (pestaña **SQL**):

```sql
SET GLOBAL event_scheduler = ON;
```

Habilita el evento `ev_marcar_vencimientos`, que marca diariamente como `VENC` las vacunas cuyo lote ya venció.

### 4. Iniciar el servidor

```bash
npm start
```

Disponible en `http://localhost:3000`.

> **Nota**: iniciá el servidor desde una terminal con `npm start`. **No** uses el botón "Open in Browser" de VS Code: abre un proxy interno que muestra solo "healthy".

---

## Usuarios de prueba

Todos los usuarios tienen la misma contraseña: **`Vacuna2026`**

| Usuario | Rol | Ubicación |
|---|---|---|
| `Administrador` | Administrador | Todas |
| `adm.ncl1`, `adm.ncl2` | Administrativo | Nivel Central (Depósito Nacional) |
| `aud.ncl1` | Auditor | Nivel Central |
| `adm.garrahan` | Administrativo | Hospital Garrahan (Dep. Provincial) |
| `aud.garrahan1`, `aud.garrahan2` | Auditor | Hospital Garrahan |
| `enf.italiano1`, `enf.italiano2` | Enfermero | Hospital Italiano |
| `enf.sanisidro1`, `enf.sanisidro2` | Enfermero | Hospital San Isidro |
| `enf.cordoba1`, `enf.cordoba2` | Enfermero | Hospital de Córdoba |
| `enf.rosario1`, `enf.rosario2` | Enfermero | Hospital de Rosario |
| `enf.tucuman1` | Enfermero | Hospital de Tucumán |
| `aud.italiano1`, `aud.sanisidro1`, `aud.cordoba1`, `aud.rosario1`, `aud.tucuman1` | Auditor | Su centro respectivo |

---

## Estructura del proyecto

```
argentina_vacuna/
├── app.js                  Entry point. Middlewares, sesión, CSRF, Passport.
├── argentina_vacuna.sql    Dump completo: schema + objetos de BD + datos de prueba.
├── modules/
│   ├── routers.js          Todas las rutas con sus middlewares de auth y rol.
│   ├── auth.js             isAuthenticated, hasRole(...), requireUbicacion.
│   └── handler.js          Handlers de errores 400/401/403/404/500.
├── controllers/            Lógica de negocio (un archivo por módulo).
├── models/                 Modelos Sequelize.
├── migrations/             Cambios de schema versionados (historial).
├── seeders/                Seeders Sequelize (estados, roles, provincias).
├── views/
│   ├── __layout/           main.pug, navbar, sidebar, footer.
│   └── [modulo]/           Vistas por módulo (listado, nuevo, modificar, buscar).
├── public/
│   ├── css/style.css       Estilos custom.
│   ├── js/[modulo]/        JS por módulo (fetch a la API REST).
│   └── img/
└── config/
    ├── config.json         Credenciales de BD (incluida, configurada para local).
    └── passport-config.js  Estrategia local con rol y ubicaciones por sesión.
```

---

## Roles y permisos

| Módulo | Admin | Auditor | Enfermero | Administrativo |
|---|---|---|---|---|
| Usuarios | CRUD | — | — | — |
| Solicitudes de Acceso | CRUD | — | — | — |
| Laboratorios | CRUD | Ver | — | Ver |
| Lotes | CRUD | Ver | Ver | Crear + Ver (solo Dep. Nacional) |
| Ubicaciones | CRUD | Ver | — | — |
| Movimientos | CRUD | Ver (sus ubic.) | Ver (destino) | Crear + Ver (sus ubic.) |
| Transportes | CRUD | Ver | — | CRUD |
| Pacientes | CRUD | Ver | Crear + Ver | — |
| Aplicaciones | CRUD | Ver (su ubic. activa) | Crear + Ver (propias) | — |
| Descartes | CRUD | Ver (su ubic. activa) | — | — |
| Reportes | Ver | Ver | — | Ver |

---

## Reportes implementados

Los seis reportes obligatorios están implementados como Stored Procedures (`sp_reporte1` a `sp_reporte6`):

1. **Compras por Laboratorio** — vacunas compradas a cada laboratorio en un rango de fecha.
2. **Trazabilidad por Lote-Proveedor** — por cada lote-proveedor (con su tipo de vacuna y laboratorio), cuántas dosis están en nación / distribución / provincia / centros / aplicadas / descartadas / vencidas.
3. **Stock por Provincia** — stock disponible por tipo de vacuna y provincia (excluye nación y distribución).
4. **Aplicaciones con Vacuna Vencida** — personas a las que se aplicó una vacuna vencida.
5. **Vacunas Vencidas No Descartadas** — agrupadas por lote, provincia y centro.
6. **Personas Vacunadas** — por tipo de vacuna, provincia y localidad.

---

## Modelo de trazabilidad

La trazabilidad se sigue **por lote-proveedor y cantidad de dosis**, no con un registro por cada dosis individual. Cada lote (`num_lote`) se rastrea a lo largo de todo su ciclo de vida:

- **Compra** — `lotes` (fechas de compra / fabricación / vencimiento / adquisición, laboratorio, país de origen).
- **Distribución** — `movimientolotes` (ubicación origen y destino, cantidad, transporte, fecha de recepción).
- **Stock por ubicación** — `stocks` (cuántas dosis del lote hay en cada depósito o centro).
- **Aplicación / Descarte** — `aplicaciones` (paciente, enfermero, centro, lote) y `descartes` (cantidad, motivo, forma).
- **Estado** — `estados` (Disponible / Aplicada / Vencida / Descartada), propagado por triggers y el evento de vencimiento.

El **Reporte 2 (Trazabilidad por Lote-Proveedor)** consolida esta vista: por cada lote informa cuántas dosis están en nación, distribución, provincia, centros, aplicadas, descartadas y vencidas. Seguir la dosis por **lote + cantidad + estado** es la práctica estándar del dominio; un registro por cada una de millones de dosis individuales no es viable ni lo requiere la operatoria.

---

## Objetos de BD destacados

### Triggers
| Trigger | Evento | Función |
|---|---|---|
| `validar_stock_movimiento` | BEFORE INSERT en movimientolotes | Valida stock suficiente en origen |
| `actualizar_stock_movimiento` | AFTER INSERT en movimientolotes | Resta de origen y suma a destino |
| `validar_stock_descarte` | BEFORE INSERT en descartes | Valida stock en la ubicación |
| `actualizar_stock_descarte` | AFTER INSERT en descartes | Resta del stock |
| `prevenir_aplicacion_vencida` | BEFORE INSERT en aplicaciones | Lanza error si la vacuna venció |
| `actualizar_estado_vencimiento` | AFTER UPDATE en lotes | Propaga VENC a las vacunas |

### Funciones
| Función | Devuelve | Uso en la app |
|---|---|---|
| `fn_stock_disponible_lote(id_lote)` | Dosis totales en stock del lote (sumando todas las ubicaciones) | Columna **Stock total** del listado de lotes |
| `fn_dias_para_vencer(id_lote)` | Días hasta el vencimiento (negativo si ya venció) | Indicador de alerta de vencimiento en el listado de lotes |

### Evento
- `ev_marcar_vencimientos` — corre diariamente y marca como `VENC` las vacunas `DISP` cuyo lote ya venció.

---

## Notas

- El `secret` de sesión en `app.js` debe cambiarse antes de cualquier deploy a producción.
- El evento `ev_marcar_vencimientos` requiere que el event scheduler de MySQL esté activado (`SET GLOBAL event_scheduler = ON;`).
- Los Stored Procedures de reportes usan el helper `extractRows(raw)` en `reporteController.js` para normalizar la respuesta entre versiones de `mysql2`.

---

## Autor

**Edder Santibañez** — Tecnicatura Universitaria en Desarrollo Web · 2026
