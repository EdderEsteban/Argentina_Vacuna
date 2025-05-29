document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

   // Manejador para editar y borrar laboratorios
    document.querySelector('.table').addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.editar-laboratorio');
        const btnBorrar = e.target.closest('.borrar-laboratorio');

        if (btnEditar) {
            const labId = btnEditar.dataset.id;
            window.location.href = `/editarlaboratorio/${labId}`;
        }

        if (btnBorrar) {
            const labId = btnBorrar.dataset.id;
            await btnBorrarLaboratorio(labId, csrfToken);
        }
    });
});

async function btnBorrarLaboratorio(id, csrfToken) {
    const confirmacion = await Swal.fire({
        title: '¿Borrar laboratorio?',
        text: "¡Esta acción no se puede revertir!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`/borrarlaboratorio/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            // Recargar la página para actualizar paginación
            window.location.reload();

        } catch (error) {
            console.error('Error al borrar:', error);
            Swal.fire('Error', 'No se pudo eliminar el laboratorio', 'error');
        }
    }
}