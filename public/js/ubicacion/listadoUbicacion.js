document.addEventListener('DOMContentLoaded', () => {
    // Obtén el token CSRF del meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

document.getElementById('btnNuevaUbicacion').addEventListener('click', function() {
    window.location.href = '/nuevoubicacion';
});

// Manejo de eventos para los botones de editar y borrar
    document.querySelector('.table').addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.editar-ubicacion');
        const btnBorrar = e.target.closest('.borrar-ubicacion');

        // Manejador para el botón de editar
        if (btnEditar) {
            const ubicacionId = btnEditar.dataset.id;
            // Redirige directamente a la página de edición
            window.location.href = `/editarubicacion/${ubicacionId}`;
        }

        // Manejador para el botón de borrar
        if (btnBorrar) {
            const ubicacionId = btnBorrar.dataset.id;
            // Llama a la función asiatncrona para borrar el paciente
            await borrarUbicacion(ubicacionId, csrfToken); 
        }
    });

});

// Funcion asíncrona para borrar ubicación
async function borrarUbicacion(id, csrfToken) {
    // Muestra un mensaje de confirmación antes de borrar
        const confirmacion = await Swal.fire({
            title: '¿Borrar Ubicación?',
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
            const response = await fetch(`/borrarubicacion/${id}`, {
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
            await Swal.fire('¡Borrado!', 'La Ubicación fue eliminada.', 'success');
            window.location.reload();

        } catch (error) {
            console.error('Error al borrar ubicación:', error);
            // Muestra un mensaje de error al usuario
            Swal.fire('Error', 'No se pudo eliminar la ubicación. Por favor, inténtalo de nuevo.', 'error');
        }
    }
}