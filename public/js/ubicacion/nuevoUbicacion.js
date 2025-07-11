document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formNuevaUbicacion');
    const btnGuardar = document.getElementById('btnGuardar');
    const csrfToken = document.querySelector('[name="_csrf"]').value;

    // Initialize Select2 for province select
    $(document).ready(function() {
        $('#id_provincia').select2({
            placeholder: 'Seleccione una provincia',
            allowClear: false,
            width: '100%',
            dropdownParent: $('#id_provincia').parent()
        });

        // Initialize Select2 for location type select
        $('#tipo').select2({
            placeholder: 'Seleccione un tipo de ubicación',
            allowClear: false,
            width: '100%',
            dropdownParent: $('#tipo').parent()
        });
    });

    btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();

        const formData = {
            nombre: form.nombre.value.trim(),
            direccion: form.direccion.value.trim(),
            telefono: form.telefono.value.trim(),
            id_provincia: form.id_provincia.value.trim(),
            tipo: form.tipo.value.trim()
        };

        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Guardando...';

        try {
            if (!validarUbicacion(formData)) {
                throw new Error('Formulario inválido');
            }

            const response = await fetch('/crearubicacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.message || 'Error al crear la ubicación',
                    errores: data.errores
                };
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Creado!',
                text: 'Ubicación creada correctamente',
                timer: 2000
            });
            window.location.href = '/ubicaciones';

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
            btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar';
        }
    });
});

function validarUbicacion(formData) {
    let isValid = true;

    if (formData.nombre === '') {
        showError('El nombre de la ubicación es obligatorio.');
        isValid = false;
    }

    if (formData.id_provincia === '') {
        showError('Debe seleccionar una provincia.');
        isValid = false;
    }

    if (formData.tipo === '') {
        showError('Debe seleccionar un tipo de ubicación.');
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