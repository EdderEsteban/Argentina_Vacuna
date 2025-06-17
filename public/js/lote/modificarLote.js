document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditarLote');
    const btnGuardar = document.getElementById('btnGuardarCambios');
    const csrfToken = document.querySelector('[name="_csrf"]').value;
    const loteId = form.dataset.id;

    btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const formData = {
            numLote: form.numLote.value.trim(),
            id_laboratorio: form.id_laboratorio.value.trim(),
            cantidad: form.cantidad.value.trim(),
            fecha_fab: form.fecha_fab.value.trim(),
            fecha_venc: form.fecha_venc.value.trim(),
            fecha_compra: form.fecha_compra.value.trim()
        };

        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

        try {
            // Validar los datos del formulario
            validarLote(formData);

            // Enviar los datos al servidor
            const response = await fetch(`/actualizarlote/${loteId}`, {
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
                text: 'Lote modificado correctamente',
                timer: 2000
            });
            window.location.href = '/lotes';

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

function validarLote(formData) {
    if (formData.numLote === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El número de lote es obligatorio.'
        });
        return false;
    }

    if (formData.id_laboratorio === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe seleccionar un laboratorio.'
        });
        return false;
    }

    if (formData.cantidad === '' || !/^\d+$/.test(formData.cantidad) || parseInt(formData.cantidad) <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La cantidad debe ser un número entero positivo mayor que cero.'
        });
        return false;
    }

    if (formData.fecha_fab === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de fabricación es obligatoria.'
        });
        return false;
    }

    if (formData.fecha_venc === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de vencimiento es obligatoria.'
        });
        return false;
    }

    if (formData.fecha_compra === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de compra es obligatoria.'
        });
        return false;
    }

    // Validar que la fecha de vencimiento sea posterior a la fecha de fabricación
    if (new Date(formData.fecha_venc) <= new Date(formData.fecha_fab)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de vencimiento debe ser posterior a la fecha de fabricación.'
        });
        return false;
    }

    return true;
}