// -----------------------------------Variables-------------------------------------------------
const formNuevoLote = document.getElementById('formNuevoLote');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnGuardar = document.getElementById('guardarNuevoLote');

// -----------------------------------Botones de acción-----------------------------------------
document.getElementById('guardarNuevoLote').addEventListener('click', function (event) {
    event.preventDefault();
    enviarFormularioNuevoLote();
});

// Boton para cancelar nuevo lote
document.getElementById('cancelarNuevoLote').addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = '/lotes';
});

// ----------------------------------Funciones-------------------------------------------------
// Validar campos del formulario de nuevo lote
function validarNuevoLote(formData) {
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

    if (formData.tipo_vacuna === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El tipo de vacuna es obligatorio.'
        });
        return false;
    }

    if (formData.nombre_comercial === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El nombre comercial es obligatorio.'
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

// Enviar formulario de nuevo lote
async function enviarFormularioNuevoLote() {
    // Estado inicial del botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `
        <i class="bi bi-hourglass me-2"></i>
        Guardando...
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const formLoteData = {
        numLote: formNuevoLote.numLote.value.trim(),
        id_laboratorio: formNuevoLote.id_laboratorio.value.trim(),
        cantidad: formNuevoLote.cantidad.value.trim(),
        tipo_vacuna: formNuevoLote.tipo_vacuna.value.trim(),
        nombre_comercial: formNuevoLote.nombre_comercial.value.trim(),
        fecha_fab: formNuevoLote.fecha_fab.value.trim(),
        fecha_venc: formNuevoLote.fecha_venc.value.trim(),
        fecha_compra: formNuevoLote.fecha_compra.value.trim()
    };

    // Validar los datos del formulario
    if (await validarNuevoLote(formLoteData)) {
        fetch('/crearlote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(formLoteData),
        })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw err; });
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: data.message || 'Lote creado correctamente',
                    timer: 2000
                }).then(() => {
                    window.location.href = '/lotes';
                });
            })
            .catch(error => {
                const mensaje = error.errores?.[0]?.mensaje
                    || error.message
                    || 'Error desconocido al crear el lote';

                const footer = error.errores?.length > 1
                    ? `<div class="text-start small">${error.errores.slice(1).map(e => `• ${e.mensaje}`).join('<br>')}</div>`
                    : '';

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    html: `<div class="text-danger">${mensaje}</div>`,
                    footer: footer
                });
            })
            .finally(() => {
                // Restaurar estado original del botón
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = `
                <i class="bi bi-save me-2"></i>
                Guardar Cambios
            `;
            });
    } else {
        // Si la validación falla, restaurar el botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = `
            <i class="bi bi-save me-2"></i>
            Guardar Cambios
        `;
    }
}