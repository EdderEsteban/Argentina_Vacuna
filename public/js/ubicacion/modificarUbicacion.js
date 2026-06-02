$(document).ready(function () {
  // Inicialización de Select2 sobre los selects del formulario
  $('#id_provincia').select2({
    placeholder: 'Seleccione una provincia',
    allowClear: true,
    width: '100%',
    dropdownParent: $('#id_provincia').parent()
  });
  $('#tipo').select2({
    placeholder: 'Seleccione un tipo de ubicación',
    allowClear: false,
    width: '100%',
    dropdownParent: $('#tipo').parent()
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('formEditarUbicacion');
  const ubicacionId = form.dataset.id;
  const csrfToken   = document.querySelector('input[name="_csrf"]').value;
  const btnGuardar  = document.getElementById('btnGuardarCambios');
  const btnCancelar = document.getElementById('btnCancelarCambios');

  // Cancelar → volver al listado
  btnCancelar.addEventListener('click', () => {
    window.location.href = '/ubicaciones';
  });

  // Guardar cambios vía PUT
  btnGuardar.addEventListener('click', async () => {
    const nombre      = document.getElementById('nombre').value.trim();
    const direccion   = document.getElementById('direccion').value.trim();
    const telefono    = document.getElementById('telefono').value.trim();
    const id_provincia = document.getElementById('id_provincia').value;
    const tipo        = document.getElementById('tipo').value;

    if (!nombre)       return Swal.fire('Campo requerido', 'El nombre es obligatorio', 'warning');
    if (!id_provincia) return Swal.fire('Campo requerido', 'Seleccioná una provincia', 'warning');
    if (!tipo)         return Swal.fire('Campo requerido', 'Seleccioná un tipo de ubicación', 'warning');

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

    try {
      const res = await fetch(`/actualizarubicacion/${ubicacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ nombre, direccion, telefono, id_provincia, tipo })
      });
      const data = await res.json();

      if (!res.ok) throw data;
      await Swal.fire('Guardado', data.message || 'Ubicación actualizada correctamente', 'success');
      window.location.href = '/ubicaciones';
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo actualizar la ubicación', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';
    }
  });
});
