document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const modalEl   = document.getElementById('modalAprobar');
  const modalBS   = new bootstrap.Modal(modalEl);
  let solicitudId = null;

  // Inicializar Select2 cuando el modal termina de abrirse (requiere visibilidad para calcular tamaños)
  modalEl.addEventListener('shown.bs.modal', () => {
    $('#selectUbicacion').select2({
      dropdownParent: $('body'),
      placeholder: 'Buscar ubicación...',
      width: $('#selectUbicacion').outerWidth()
    });
    $('#selectRol').select2({
      dropdownParent: $('body'),
      placeholder: 'Seleccionar rol...',
      width: $('#selectRol').outerWidth()
    });
  });

  // Destruir Select2 al cerrar para evitar duplicados en la próxima apertura
  modalEl.addEventListener('hidden.bs.modal', () => {
    if ($('#selectUbicacion').hasClass('select2-hidden-accessible')) {
      $('#selectUbicacion').select2('destroy');
    }
    if ($('#selectRol').hasClass('select2-hidden-accessible')) {
      $('#selectRol').select2('destroy');
    }
  });

  // Abrir modal con los datos de la solicitud seleccionada
  document.querySelectorAll('.btn-aprobar').forEach(btn => {
    btn.addEventListener('click', () => {
      solicitudId = btn.dataset.id;
      document.getElementById('modalUsuario').textContent = btn.dataset.usuario || '(sin usuario)';
      document.getElementById('modalMotivo').textContent  = btn.dataset.motivo;
      // Reset nativo antes de mostrar (Select2 aún no está inicializado aquí)
      document.getElementById('selectUbicacion').value = '';
      document.getElementById('selectRol').value       = '';
      modalBS.show();
    });
  });

  // Confirmar aprobación y crear usuario
  document.getElementById('btnConfirmarAprobar').addEventListener('click', async () => {
    const id_ubicacion = document.getElementById('selectUbicacion').value;
    const id_rol       = document.getElementById('selectRol').value;

    if (!id_ubicacion || !id_rol) {
      return Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Seleccioná una ubicación y un rol para continuar.' });
    }

    const btn = document.getElementById('btnConfirmarAprobar');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

    try {
      const res  = await fetch(`/solicitudes/${solicitudId}/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body:    JSON.stringify({ estado: 'Aprobado', id_ubicacion, id_rol })
      });
      const data = await res.json();

      if (res.ok) {
        modalBS.hide();
        await Swal.fire({
          icon:  'success',
          title: 'Solicitud aprobada',
          html:  `Se ha aceptado la solicitud y se ha creado satisfactoriamente el usuario <strong>#${data.usuario.id}</strong> (<code>${data.usuario.usuario}</code>).`,
          confirmButtonColor: '#198754'
        });
        window.location.reload();
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Aprobar y crear usuario';
    }
  });

  // Rechazar solicitud
  document.querySelectorAll('.btn-rechazar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmado = await Swal.fire({
        title:             '¿Rechazar solicitud?',
        text:              'Esta acción no se puede deshacer.',
        icon:              'warning',
        showCancelButton:  true,
        confirmButtonText: 'Sí, rechazar',
        confirmButtonColor: '#dc3545',
        cancelButtonText:  'Cancelar'
      });
      if (!confirmado.isConfirmed) return;

      try {
        const res  = await fetch(`/solicitudes/${btn.dataset.id}/estado`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
          body:    JSON.stringify({ estado: 'Rechazado' })
        });
        const data = await res.json();
        if (res.ok) {
          await Swal.fire({ icon: 'success', title: 'Rechazada', text: data.message, timer: 1500, showConfirmButton: false });
          window.location.reload();
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
      }
    });
  });
});
