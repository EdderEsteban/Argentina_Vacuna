$(document).ready(function () {
  // Inicialización de Select2 sobre los selects del formulario
  $('#id_lote').select2({ placeholder: 'Seleccione un lote', width: '100%', dropdownParent: $('#id_lote').parent() });
  $('#id_ubicacion_origen').select2({ placeholder: 'Seleccione origen', width: '100%', dropdownParent: $('#id_ubicacion_origen').parent() });
  $('#id_ubicacion_destino').select2({ placeholder: 'Seleccione destino', width: '100%', dropdownParent: $('#id_ubicacion_destino').parent() });
  $('#id_transporte').select2({ placeholder: 'Sin transporte (movimiento interno)', allowClear: true, width: '100%', dropdownParent: $('#id_transporte').parent() });
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formMovimiento');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idLote       = document.getElementById('id_lote').value;
    const cantidad     = parseInt(document.getElementById('cantidad').value, 10);
    const idOrigen     = document.getElementById('id_ubicacion_origen').value;
    const idDestino    = document.getElementById('id_ubicacion_destino').value;
    const fecha        = document.getElementById('fecha_movimiento').value;

    if (!idLote) {
      return Swal.fire('Validación', 'Debe seleccionar un lote.', 'warning');
    }
    if (!cantidad || cantidad < 1) {
      return Swal.fire('Validación', 'La cantidad debe ser mayor a 0.', 'warning');
    }
    if (!idOrigen) {
      return Swal.fire('Validación', 'Debe seleccionar una ubicación de origen.', 'warning');
    }
    if (!idDestino) {
      return Swal.fire('Validación', 'Debe seleccionar una ubicación destino.', 'warning');
    }
    if (idOrigen === idDestino) {
      return Swal.fire('Validación', 'La ubicación origen y destino no pueden ser la misma.', 'warning');
    }
    if (!fecha) {
      return Swal.fire('Validación', 'Debe ingresar una fecha de movimiento.', 'warning');
    }
    if (fecha > new Date().toISOString().split('T')[0]) {
      return Swal.fire('Validación', 'La fecha de movimiento no puede ser futura.', 'warning');
    }

    const confirm = await Swal.fire({
      title: '¿Confirmar movimiento?',
      text: `Se moverán ${cantidad} dosis al destino seleccionado.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    const idTransporte = document.getElementById('id_transporte').value;
    const data = { id_lote: idLote, cantidad, id_ubicacion_origen: idOrigen, id_ubicacion_destino: idDestino, fecha_movimiento: fecha, id_transporte: idTransporte || null };

    try {
      const res = await fetch('/crearmovimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire('Éxito', result.message, 'success').then(() => {
          window.location.href = '/movimientos';
        });
      } else {
        Swal.fire('Error', result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al registrar el movimiento.', 'error');
    }
  });
});
