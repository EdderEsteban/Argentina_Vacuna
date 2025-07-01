document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Manejador para editar y borrar lotes
    document.querySelector('.table').addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.editar-lote');
        const btnBorrar = e.target.closest('.borrar-lote');

        if (btnEditar) {
            const loteId = btnEditar.dataset.id;
            window.location.href = `/editarLote/${loteId}`;
        }

        if (btnBorrar) {
            const loteId = btnBorrar.dataset.id;
            await btnBorrarLote(loteId, csrfToken); 
        }
    });    
});

// Función para borrar lote
async function btnBorrarLote(id, csrfToken) {
    const confirmacion = await Swal.fire({
        title: '¿Borrar Lote?',
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
            const response = await fetch(`/borrarlote/${id}`, {
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
            Swal.fire('Error', 'No se pudo eliminar el lote', 'error');
        }
    }
}