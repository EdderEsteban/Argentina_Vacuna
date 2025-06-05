// -----------------------------------Variables-------------------------------------------------
const formNuevoLote = document.getElementById('formNuevoLote');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnGuardar = document.getElementById('guardarNuevoLaboratorio');

// -----------------------------------Botones de acción-----------------------------------------
document.getElementById('guardarNuevoLote').addEventListener('click', function (event) {
    event.preventDefault();
    enviarFormularioNuevoLote();
});


// Boton para cancelar nuevo laboratorio
document.getElementById('cancelarNuevoLote').addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = '/lotes'; 
});

// ----------------------------------Funciones-------------------------------------------------
// Validar campos del formulario de nuevo laboratorio
function validarNuevoLote(formData) {
    if (formData.nombre === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El nombre del laboratorio es obligatorio.'
        });
        return false;
    }
    if (formData.nacionalidad === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La nacionalidad del laboratorio es obligatoria.'
        });
        return false;
    }
    return true;
}

// Enviar formulario de nuevo laboratorio
function enviarFormularioNuevoLote() {
    // Estado inicial del botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `
        <i class="bi bi-hourglass me-2"></i>
        Guardando...
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const formLaboratorioData = {
        nombre: formNuevoLote.nombreLaboratorio.value.trim(),
        nacionalidad: formNuevoLote.nacionalidadLaboratorio.value.trim()
    };

    if (validarNuevoLaboratorio(formLaboratorioData)) {
        fetch('/crearlote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(formLaboratorioData),
        })
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw err; });
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: data.message || 'Laboratorio creado correctamente',
                timer: 2000
            }).then(() => {
                window.location.href = '/laboratorios';
            });
        })
        .catch(error => {
            const mensaje = error.errores?.[0]?.mensaje 
                || error.message 
                || 'Error desconocido al crear el laboratorio';

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