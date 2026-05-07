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

  // Obtiene todos los roles disponibles desde la API para los selectores del modal
  async function cargarRoles() {
    const res = await fetch('/roles');
    return res.json();
  }

  // Actualiza el panel de resumen con las ubicaciones y roles asignados en la tabla del modal
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

  // Valida los campos del formulario (DNI, correo, password, ubicaciones) antes de crear el usuario
  function validarCampos() {
    const nombre   = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();
    const dni      = form.dni.value.trim();
    const usuario  = form.usuario.value.trim();
    const password = form.password.value.trim();
    const correo   = form.correo.value.trim();
    const telefono = form.telefono.value.trim();

    if (!nombre || !apellido || !dni || !usuario || !password || !correo || !telefono) {
      Swal.fire('Campos incompletos', 'Por favor complete todos los campos obligatorios.', 'warning');
      return false;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      Swal.fire('DNI inválido', 'El DNI debe ser un número de 7 u 8 dígitos.', 'warning');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      Swal.fire('Correo inválido', 'Ingresá una dirección de correo electrónico válida.', 'warning');
      return false;
    }

    if (password.length < 8) {
      Swal.fire('Contraseña muy corta', 'La contraseña debe tener al menos 8 caracteres.', 'warning');
      return false;
    }

    const rows = [...tablaAsignadas.querySelectorAll('tr')];
    if (!rows.length) {
      Swal.fire('Sin ubicaciones', 'Debe asignar al menos una ubicación.', 'warning');
      return false;
    }

    return true;
  }
});