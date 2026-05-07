document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  // Confirma con SweetAlert2 y envía el cambio de estado (Aprobado/Rechazado) de una solicitud
  async function cambiarEstado(id, estado) {
    const accion = estado === 'Aprobado' ? 'aprobar' : 'rechazar';
    const confirm = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} solicitud?`,
      text: 'Esta acción actualizará el estado de la solicitud.',
      icon: estado === 'Aprobado' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      confirmButtonColor: estado === 'Aprobado' ? '#198754' : '#dc3545',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/solicitudes/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ estado })
      });
      const data = await res.json();
      if (res.ok) {
        await Swal.fire('Actualizado', data.message, 'success');
        window.location.reload();
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'No se pudo actualizar la solicitud.', 'error');
    }
  }

  document.querySelectorAll('.btn-aprobar').forEach(btn => {
    btn.addEventListener('click', () => cambiarEstado(btn.dataset.id, 'Aprobado'));
  });

  document.querySelectorAll('.btn-rechazar').forEach(btn => {
    btn.addEventListener('click', () => cambiarEstado(btn.dataset.id, 'Rechazado'));
  });
});
