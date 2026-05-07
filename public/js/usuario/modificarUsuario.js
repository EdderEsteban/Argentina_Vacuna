console.log('modificarUsuario.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  // Datos globales
  const csrfToken      = document.querySelector('input[name="_csrf"]').value;
  const userId         = document.querySelector('input[name="id"]').value;
  const modal          = new bootstrap.Modal(document.getElementById('modalUbicaciones'));
  const selDisp        = document.getElementById('selUbicacionesDisponibles');
  const tablaAsignadas = document.getElementById('tablaUbicacionesAsignadas').querySelector('tbody');

  // Cargar ubicaciones y roles
  // Carga las ubicaciones asignadas y los roles desde la API para poblar el modal
  async function cargarDatos() {
    try {
      // a) ubicaciones asignadas
      const res = await fetch(`/usuarios/${userId}/ubicaciones`);
      const asignadas = await res.json();

      // b) roles para los <select>
      const rolesRes = await fetch('/roles');
      const roles   = await rolesRes.json();

      // pintar tabla
      pintarAsignadas(asignadas, roles);

      // marcar como “ya asignadas” en el select izquierdo
      const idsAsignadas = asignadas.map(a => a.id);
      [...selDisp.options].forEach(opt => {
        opt.disabled = idsAsignadas.includes(parseInt(opt.value));
      });
    } catch (err) {
      console.error(err);
    }
  }

  // --------------------------
  // 3.  Pintar tabla de asignadas
  // --------------------------
  // Renderiza las filas de la tabla de ubicaciones asignadas con su selector de rol
  function pintarAsignadas(lista, roles) {
    tablaAsignadas.innerHTML = '';
    lista.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.nombre}</td>
        <td>
          <select class="form-select form-select-sm rol-select" data-ubicacion="${u.id}">
            ${roles.map(r => `<option value="${r.id}" ${r.id === u.id_rol ? 'selected' : ''}>${r.nombre}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger quitar" data-id="${u.id}">×</button>
        </td>
      `;
      tablaAsignadas.appendChild(tr);
    });
  }

  // --------------------------
  // 4.  Agregar ubicación nueva
  // --------------------------
  selDisp.addEventListener('change', () => {
    const selected = [...selDisp.selectedOptions].filter(o => !o.disabled);
    selected.forEach(opt => {
      // prevenir duplicados
      if ([...tablaAsignadas.querySelectorAll('tr')].some(tr => tr.dataset.ubicacion === opt.value)) return;

      // pedir roles si no los tenemos
      fetch('/roles')
        .then(r => r.json())
        .then(roles => {
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
            </td>
          `;
          tablaAsignadas.appendChild(tr);
          opt.disabled = true;
          selDisp.selectedIndex = -1;
        });
    });
  });

  // --------------------------
  // 5.  Quitar ubicación
  // --------------------------
  tablaAsignadas.addEventListener('click', e => {
    if (!e.target.classList.contains('quitar')) return;
    const id = e.target.dataset.id;
    const opt = selDisp.querySelector(`option[value="${id}"]`);
    if (opt) opt.disabled = false;
    e.target.closest('tr').remove();
  });

  // --------------------------
  // 6.  Guardar cambios del modal
  // --------------------------
  document.getElementById('btnGuardarUbicaciones').addEventListener('click', async () => {
    const rows = [...tablaAsignadas.querySelectorAll('tr')];
    const payload = rows.map(tr => ({
      id_ubicacion: parseInt(tr.dataset.ubicacion || tr.querySelector('select').dataset.ubicacion),
      id_rol: parseInt(tr.querySelector('.rol-select').value)
    }));

    try {
      const res = await fetch(`/usuarios/${userId}/ubicaciones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        modal.hide();
        Swal.fire('Guardado', data.message || 'Ubicaciones actualizadas', 'success');
      } else {
        Swal.fire('Error', data.message || 'No se pudieron guardar los cambios', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Falló la conexión', 'error');
    }
  });

  // --------------------------
  // 7.  Cargar al abrir el modal
  // --------------------------
  document.getElementById('modalUbicaciones').addEventListener('shown.bs.modal', cargarDatos);

  // --------------------------
  // 8.  Guardar correo y teléfono
  // --------------------------
  document.getElementById('btnGuardar').addEventListener('click', async () => {
    const correo   = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!correo) {
      return Swal.fire('Campo requerido', 'El correo electrónico es obligatorio.', 'warning');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return Swal.fire('Correo inválido', 'Ingresá una dirección de correo electrónico válida.', 'warning');
    }

    try {
      const res = await fetch(`/actualizarUsuario/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ correo, telefono })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Guardado', data.message || 'Datos actualizados correctamente.', 'success')
          .then(() => window.location.href = '/usuarios');
      } else {
        Swal.fire('Error', data.message || 'No se pudieron guardar los cambios.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Falló la conexión.', 'error');
    }
  });

  // --------------------------
  // 9.  Blanquear contraseña
  // --------------------------
  document.getElementById('btnBlanquear').addEventListener('click', async () => {
    const confirm = await Swal.fire({
      title: '¿Blanquear contraseña?',
      text: 'Se generará una contraseña temporal aleatoria.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, blanquear',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/usuarios/${userId}/blanquear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Contraseña blanqueada', data.message, 'success');
      } else {
        Swal.fire('Error', data.message || 'No se pudo blanquear la contraseña.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Falló la conexión.', 'error');
    }
  });
});