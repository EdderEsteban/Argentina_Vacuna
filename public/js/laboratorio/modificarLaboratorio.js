document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditarLaboratorio');
    const btnGuardar = document.getElementById('btnGuardarCambios');
    const csrfToken = document.querySelector('[name="_csrf"]').value;
    const labId = form.dataset.id;

    btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const formData = {
            nombre: form.nombre.value.trim(),
            nacionalidad: form.nacionalidad.value.trim()
        };

        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

        try {
            const response = await fetch(`/actualizarlaboratorio/${labId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw { 
                    message: data.message || 'Error al actualizar',
                    errores: data.errores 
                };
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Laboratorio modificado correctamente',
                timer: 2000
            });
            window.location.href = '/laboratorios';

        } catch (error) {
            const mensaje = error.errores?.[0]?.mensaje || error.message;
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `<div class="text-danger">${mensaje}</div>`,
                footer: error.errores?.length > 1 
                    ? `<div class="text-start small">${error.errores.slice(1).map(e => `• ${e.mensaje}`).join('<br>')}</div>`
                    : ''
            });
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';
        }
    });
});