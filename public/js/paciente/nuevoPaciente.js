// -----------------------------------Variables-------------------------------------------------
const formNuevoPaciente = document.getElementById('formNuevoPaciente');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnGuardar = document.getElementById('guardarNuevoPaciente');

// -----------------------------------Botones de acción-----------------------------------------
document.getElementById('guardarNuevoPaciente').addEventListener('click', function (event) {
    event.preventDefault();
    enviarFormularioNuevoPaciente();
});

// Boton para cancelar nuevo paciente
document.getElementById('cancelarNuevoPaciente').addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = '/pacientes'; 
});

// ----------------------------------Funciones-------------------------------------------------
// Validar campos del formulario de nuevo paciente
function validarNuevoPaciente(formData) {
    if (formData.nombre === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El nombre del paciente es obligatorio.'
        });
        return false;
    }
    if (formData.apellido === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El apellido del paciente es obligatorio.'
        });
        return false;
    }
    if (formData.dni === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El DNI del paciente es obligatorio.'
        });
        return false;
    }
    if (!/^\d{7,8}$/.test(formData.dni)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El DNI debe tener 7 u 8 dígitos.'
        });
        return false;
    }
    return true;
}

// Enviar formulario de nuevo paciente
function enviarFormularioNuevoPaciente() {
    // Estado inicial del botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `
        <i class="bi bi-hourglass me-2"></i>
        Guardando...
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const formPacienteData = {
        nombre: formNuevoPaciente.nombrePaciente.value.trim(),
        apellido: formNuevoPaciente.apellidoPaciente.value.trim(),
        dni: formNuevoPaciente.dniPaciente.value.trim(),
        telefono: formNuevoPaciente.telefonoPaciente.value.trim() || null,
        correo: formNuevoPaciente.correoPaciente.value.trim() || null,
        id_provincia: parseInt(formNuevoPaciente.id_provincia.value),
        id_ubicacion_registro: parseInt(formNuevoPaciente.ubicacionRegistroPaciente.value)
    };

    if (validarNuevoPaciente(formPacienteData)) {
        // Enviar datos al servidor
        fetch('/crearpaciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(formPacienteData),
        })
        .then(response => {
            if (!response.ok) return response.json().then(err => { throw err; });
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: data.message || 'Paciente creado correctamente',
                timer: 2000
            }).then(() => {
                window.location.href = '/pacientes';
            });
        })
        .catch(error => {
            const mensaje = error.errores?.[0]?.mensaje 
                || error.message 
                || 'Error desconocido al crear el paciente';

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