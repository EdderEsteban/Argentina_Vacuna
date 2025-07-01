document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditarLote');
    const btnGuardar = document.getElementById('btnGuardarCambios');
    const csrfToken = document.querySelector('[name="_csrf"]').value;
    const loteId = form.dataset.id;

    // Cancel button
    document.getElementById('btnCancelarCambios')?.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = '/lotes';
    });

    btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();

        const formData = {
            numLote: form.numLote.value.trim(),
            id_laboratorio: form.id_laboratorio.value.trim(),
            cantidad: form.cantidad.value.trim(),
            tipo_vacuna: form.tipo_vacuna.value.trim(),
            nombre_comercial: form.nombre_comercial.value.trim(),
            fecha_fab: form.fecha_fab.value.trim(),
            fecha_venc: form.fecha_venc.value.trim(),
            fecha_compra: form.fecha_compra.value.trim()
        };

        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

        try {
            if (!validarLote(formData)) {
                throw new Error('Formulario inválido');
            }

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
                text: 'Lote y vacunas modificados correctamente',
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
    let isValid = true;

    if (formData.numLote === '') {
        showError('El número de lote es obligatorio.');
        isValid = false;
    }

    if (formData.id_laboratorio === '') {
        showError('Debe seleccionar un laboratorio.');
        isValid = false;
    }

    if (!/^\d+$/.test(formData.cantidad) || parseInt(formData.cantidad) <= 0) {
        showError('La cantidad debe ser un número entero positivo mayor que cero.');
        isValid = false;
    }

    if (formData.tipo_vacuna === '') {
        showError('El tipo de vacuna es obligatorio.');
        isValid = false;
    }

    if (formData.nombre_comercial === '') {
        showError('El nombre comercial es obligatorio.');
        isValid = false;
    }

    if (formData.fecha_fab === '') {
        showError('La fecha de fabricación es obligatoria.');
        isValid = false;
    }

    if (formData.fecha_venc === '') {
        showError('La fecha de vencimiento es obligatoria.');
        isValid = false;
    }

    if (formData.fecha_compra === '') {
        showError('La fecha de compra es obligatoria.');
        isValid = false;
    }

    if (new Date(formData.fecha_venc) <= new Date(formData.fecha_fab)) {
        showError('La fecha de vencimiento debe ser posterior a la fecha de fabricación.');
        isValid = false;
    }

    return isValid;
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}