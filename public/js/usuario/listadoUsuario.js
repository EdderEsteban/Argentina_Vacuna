document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    window.location.href = '/nuevoUsuario';
  });

  document.querySelector('.table').addEventListener('click', (e) => {
    const btnEditar = e.target.closest('.editar-usuario');
    if (!btnEditar) return;

    const usuarioId = btnEditar.dataset.id;
    window.location.href = `/editarUsuario/${usuarioId}`;
  })
  
  document.querySelector('.table').addEventListener('click', async (e) => {
    const btnBorrar = e.target.closest('.borrar-usuario');
    if (!btnBorrar) return;

    const usuarioId = btnBorrar.dataset.id;

    const confirmacion = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`/borrarUsuario/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });

      if (!res.ok) throw new Error('Error al eliminar');

      await Swal.fire('Eliminado', 'El usuario fue eliminado.', 'success');
      window.location.reload();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
    }
  });
});