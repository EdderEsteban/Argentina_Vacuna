/*  modificarUsuario.js  */
document.addEventListener('DOMContentLoaded', () => {
  const userId    = document.querySelector('input[name="id"]').value;
  const csrfToken = document.querySelector('input[name="_csrf"]').value;
  const modal     = new bootstrap.Modal(document.getElementById('modalUbicaciones'));
  const selDisp   = document.getElementById('selUbicacionesDisponibles');
  const tablaAsig = document.querySelector('#tablaUbicacionesAsignadas tbody');
  const listaRes  = document.getElementById('listaResumen');
  const resumenDiv= document.getElementById('resumenUbicaciones');
  const btnGuardar= document.getElementById('btnGuardar');
  const btnBlanq  = document.getElementById('btnBlanquear');

  /* ---------- helpers ---------- */
  const cargarRoles = async () => {
    const r = await fetch('/roles');
    return r.json();
  };

  const actualizarResumen = () => {
    const rows = [...tablaAsig.querySelectorAll('tr')];
    if (!rows.length) { resumenDiv.style.display = 'none'; return; }
    listaRes.innerHTML = '';
    rows.forEach(tr => {
      const ubi = tr.cells[0].textContent.trim();
      const rol = tr.querySelector('.rol-select').selectedOptions[0].textContent;
      listaRes.insertAdjacentHTML('beforeend',
        `<li class="list-group-item d-flex justify-content-between">
          <span>${ubi}</span><span class="badge bg-primary">${rol}</span>
        </li>`);
    });
    resumenDiv.style.display = 'block';
  };

  /* ---------- carga inicial (ubicaciones ya asignadas) ---------- */
  const cargarAsignadas = async () => {
    const asign = await fetch(`/usuarios/${userId}/ubicaciones`).then(r => r.json());
    const roles = await cargarRoles();
    asign.forEach(({ id, nombre, id_rol }) => {
      const tr = document.createElement('tr');
      tr.dataset.ubicacion = id;
      tr.innerHTML = `
        <td>${nombre}</td>
        <td>
          <select class="form-select form-select-sm rol-select">
            ${roles.map(r => `<option value="${r.id}" ${r.id === id_rol ? 'selected' : ''}>${r.nombre}</option>`).join('')}
          </select>
        </td>
        <td><button class="btn btn-sm btn-outline-danger quitar" data-id="${id}">×</button></td>`;
      tablaAsig.appendChild(tr);
      const opt = selDisp.querySelector(`option[value="${id}"]`);
      if (opt) opt.disabled = true;
    });
  };

  /* ---------- agregar ubicación ---------- */
  selDisp.addEventListener('change', async () => {
    const roles = await cargarRoles();
    [...selDisp.selectedOptions]
      .filter(o => !o.disabled)
      .forEach(opt => {
        if ([...tablaAsig.querySelectorAll('tr')].some(tr => tr.dataset.ubicacion === opt.value)) return;
        const tr = document.createElement('tr');
        tr.dataset.ubicacion = opt.value;
        tr.innerHTML = `
          <td>${opt.text}</td>
          <td>
            <select class="form-select form-select-sm rol-select">
              ${roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
          </td>
          <td><button class="btn btn-sm btn-outline-danger quitar" data-id="${opt.value}">×</button></td>`;
        tablaAsig.appendChild(tr);
        opt.disabled = true;
        selDisp.selectedIndex = -1;
      });
  });

  /* ---------- quitar ubicación ---------- */
  tablaAsig.addEventListener('click', e => {
    if (!e.target.classList.contains('quitar')) return;
    const id = e.target.dataset.id;
    const opt = selDisp.querySelector(`option[value="${id}"]`);
    if (opt) opt.disabled = false;
    e.target.closest('tr').remove();
    actualizarResumen();
  });

  /* ---------- guardar modal → solo pinta resumen ---------- */
  document.getElementById('btnGuardarUbicaciones').addEventListener('click', () => {
    actualizarResumen();
    modal.hide();
  });

  /* ---------- guardar cambios (correo + teléfono + ubicaciones) ---------- */
  btnGuardar.addEventListener('click', async () => {
    const correo   = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    // Validaciones básicas
    if (!correo) return Swal.fire('Campo faltante', 'El correo es obligatorio', 'warning');

    const rows = [...tablaAsig.querySelectorAll('tr')];
    if (!rows.length) return Swal.fire('Sin ubicaciones', 'Debe asignar al menos una ubicación.', 'warning');

    const ubicaciones = rows.map(tr => ({
      id_ubicacion: parseInt(tr.dataset.ubicacion),
      id_rol: parseInt(tr.querySelector('.rol-select').value)
    }));

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

    try {
      // 1. Datos personales
      const r1 = await fetch(`/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ correo, telefono })
      });
      if (!r1.ok) console.warn('Error al actualizar correo/teléfono', await r1.json());

      // 2. Ubicaciones/perfiles
      const r2 = await fetch(`/usuarios/${userId}/ubicaciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ ubicaciones })
      });
      if (!r2.ok) console.warn('Error al actualizar ubicaciones', await r2.json());

      // 3. Todo bien
      await Swal.fire('¡Actualizado!', 'Cambios guardados correctamente', 'success');
      window.location.href = '/usuario';

    } catch (e) {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';
    }
  });

  /* ---------- blanquear contraseña ---------- */
  btnBlanq.addEventListener('click', async (e) => {
    e.preventDefault();
    const { isConfirmed } = await Swal.fire({
      title: '¿Blanquear contraseña?',
      text: 'Se generará una clave aleatoria',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, blanquear'
    });
    if (!isConfirmed) return;

    try {
      const r = await fetch(`/usuarios/${userId}/blanquear`, {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await r.json();
      if (!r.ok) throw data;
      await Swal.fire('Blanqueada', data.message, 'info');
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo blanquear', 'error');
    }
  });

  /* ---------- inicializar ---------- */
  cargarAsignadas();
});