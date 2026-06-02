const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Confirmar la llegada física de un lote en tránsito al depósito destino
document.querySelectorAll('.btn-recepcion').forEach(btn => {
  btn.addEventListener('click', async () => {
    const { id, lote, origen, destino } = btn.dataset;

    const confirmacion = await Swal.fire({
      title: '¿Confirmar recepción del lote?',
      html: `
        <div class="text-start small">
          <p class="mb-1"><strong>Lote:</strong> ${lote}</p>
          <p class="mb-1"><strong>Origen:</strong> ${origen}</p>
          <p class="mb-1"><strong>Destino:</strong> ${destino}</p>
        </div>
        <p class="mt-2 text-muted small">Se registrará la fecha y hora de llegada del transporte.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibido',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`/movimientos/${id}/recepcion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();

      if (data.success) {
        await Swal.fire('¡Recepción registrada!', 'El lote fue marcado como recibido en este depósito.', 'success');
        location.reload();
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  });
});
