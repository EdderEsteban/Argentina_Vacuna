document.addEventListener('DOMContentLoaded', () => {
    // Obtén el token CSRF del meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    document.querySelector('.table').addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.editar-paciente');
        const btnBorrar = e.target.closest('.borrar-paciente');

        // Manejador para el botón de editar
        if (btnEditar) {
            const pacienteId = btnEditar.dataset.id;
            // Redirige directamente a la página de edición
            window.location.href = `/editarpaciente/${pacienteId}`;
        }

        // Manejador para el botón de borrar
        if (btnBorrar) {
            const pacienteId = btnBorrar.dataset.id;
            // Llama a la función asíncrona para borrar el paciente
            await borrarPaciente(pacienteId, csrfToken); 
        }
    });
});
async function borrarPaciente(id, csrfToken) {
    const confirmacion = await Swal.fire({
        title: '¿Borrar Paciente?',
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
            const response = await fetch(`/borrarpaciente/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': csrfToken 
                }
            });

            // Verifica si la respuesta HTTP fue exitosa
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'Error en la respuesta del servidor');
            }

            // Muestra mensaje de éxito y recarga la página
            await Swal.fire('¡Borrado!', 'El paciente fue eliminado.', 'success');
            window.location.reload();

        } catch (error) {
            console.error('Error al borrar paciente:', error);
            // Muestra un mensaje de error al usuario
            Swal.fire('Error', 'No se pudo eliminar el paciente. Por favor, inténtalo de nuevo.', 'error');
        }
    }
}