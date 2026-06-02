document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  // Borrar transporte con confirmación
  document.querySelectorAll('.btn-borrar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { id, nombre, movil } = btn.dataset;
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar transporte?',
        html: `<b>${nombre}</b> — <code>${movil}</code>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      if (!isConfirmed) return;

      try {
        const res = await fetch(`/borrartransporte/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        });
        const data = await res.json();
        if (!res.ok) throw data;
        await Swal.fire('Eliminado', data.message, 'success');
        window.location.reload();
      } catch (e) {
        Swal.fire('Error', e.message || 'No se pudo eliminar el transporte', 'error');
      }
    });
  });
});
