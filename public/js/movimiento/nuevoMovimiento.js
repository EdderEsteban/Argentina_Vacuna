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
    if (!idDestino) {
      return Swal.fire('Validación', 'Debe seleccionar una ubicación destino.', 'warning');
    }
    if (idOrigen && idOrigen === idDestino) {
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

    const data = { id_lote: idLote, cantidad, id_ubicacion_origen: idOrigen, id_ubicacion_destino: idDestino, fecha_movimiento: fecha };

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
