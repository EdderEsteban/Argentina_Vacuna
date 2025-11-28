// nuevoUsuario.js
console.log('nuevoUsuario.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formNuevoUsuario');
  const btnGuardar = document.getElementById('guardarNuevoUsuario');
  const csrfToken = document.querySelector('input[name="_csrf"]').value;
  const modal = new bootstrap.Modal(document.getElementById('modalUbicaciones'));
  const selDisp = document.getElementById('selUbicacionesDisponibles');
  const tablaAsignadas = document.querySelector('#tablaUbicacionesAsignadas tbody');
  const resumenDiv = document.getElementById('resumenUbicaciones');
  const listaResumen = document.getElementById('listaResumen');

  // Cancelar → volver a /usuarios
  document.getElementById('cancelar').addEventListener('click', () => {
    window.location.href = '/usuarios';
  });

  async function cargarRoles() {
    const res = await fetch('/roles');
    return res.json();
  }

  function actualizarResumen() {
    const rows = tablaAsignadas.querySelectorAll('tr');
    if (!rows.length) {
      resumenDiv.style.display = 'none';
      return;
    }

    listaResumen.innerHTML = '';
    rows.forEach(tr => {
      const ubicacion = tr.cells[0].textContent.trim();
      const rol = tr.querySelector('.rol-select').selectedOptions[0].textContent;
      listaResumen.insertAdjacentHTML(
        'beforeend',
        `<li class="list-group-item d-flex justify-content-between">
          <span>${ubicacion}</span>
          <span class="badge bg-primary">${rol}</span>
        </li>`
      );
    });
    resumenDiv.style.display = 'block';
  }

  // Agregar ubicación
  selDisp.addEventListener('change', async () => {
    const roles = await cargarRoles();
    [...selDisp.selectedOptions]
      .filter(o => !o.disabled)
      .forEach(opt => {
        if ([...tablaAsignadas.querySelectorAll('tr')].some(tr => tr.dataset.ubicacion === opt.value)) return;

        const tr = document.createElement('tr');
        tr.dataset.ubicacion = opt.value;
        tr.innerHTML = `
          <td>${opt.text}</td>
          <td>
            <select class="form-select form-select-sm rol-select">
              ${roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger quitar" data-id="${opt.value}">×</button>
          </td>`;
        tablaAsignadas.appendChild(tr);
        opt.disabled = true;
        selDisp.selectedIndex = -1;
      });
  });

  // Quitar ubicación
  tablaAsignadas.addEventListener('click', e => {
    if (!e.target.classList.contains('quitar')) return;
    const id = e.target.dataset.id;
    const opt = selDisp.querySelector(`option[value="${id}"]`);
    if (opt) opt.disabled = false;
    e.target.closest('tr').remove();
    actualizarResumen();
  });

  // Guardar modal → mostrar resumen
  document.getElementById('btnGuardarUbicaciones').addEventListener('click', () => {
    actualizarResumen();
    modal.hide();
  });

  // Guardar formulario principal
  btnGuardar.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;  
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.ubicaciones = [...tablaAsignadas.querySelectorAll('tr')].map(tr => ({
      id_ubicacion: parseInt(tr.dataset.ubicacion),
      id_rol: parseInt(tr.querySelector('.rol-select').value)
    }));

    try {
      const res = await fetch('/crearUsuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) {
        Swal.fire('Error', result.message || 'Error al crear usuario', 'error');
        return;
      }
      await Swal.fire('¡Creado!', result.message, 'success', { timer: 2000 });

      window.location.href = '/usuarios';
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
    }
  });

  // Validar que todos los campos estén llenos ANTES de enviar  
  function validarCampos() {
    const campos = [
      form.nombre.value.trim(),
      form.apellido.value.trim(),
      form.dni.value.trim(),
      form.usuario.value.trim(),
      form.password.value.trim(),
      form.correo.value.trim(),
      form.telefono.value.trim()
    ];

    if (campos.some(c => c === '')) {
      Swal.fire('Campos incompletos', 'Por favor complete todos los campos.', 'warning');
      return false;
    }

    // Validar que haya al menos una ubicación asignada
    const rows = [...tablaAsignadas.querySelectorAll('tr')];
    if (!rows.length) {
      Swal.fire('Sin ubicaciones', 'Debe asignar al menos una ubicación.', 'warning');
      return false;
    }

    return true;
  }
});