// -----------------------------------Variables-------------------------------------------------
const formEditarPaciente = document.getElementById('formEditarPaciente');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnGuardar = document.getElementById('guardarCambiosPaciente');
const pacienteId = document.getElementById('pacienteId').value;

// -----------------------------------Botones de acción-----------------------------------------
document.getElementById('guardarCambiosPaciente').addEventListener('click', function (event) {
    event.preventDefault();
    enviarFormularioEditarPaciente();
});

// Boton para cancelar edición de paciente
document.getElementById('cancelarEdicionPaciente').addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = '/pacientes';
});

// ----------------------------------Funciones-------------------------------------------------
// Validar campos del formulario de edición de paciente
function validarEditarPaciente(formData) {
    // Validar Nombre
    if (formData.nombre === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El nombre del paciente es obligatorio.'
        });
        return false;
    }

    // Validar Apellido
    if (formData.apellido === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El apellido del paciente es obligatorio.'
        });
        return false;
    }

    // Validar DNI (solo números y longitud 7 u 8)
    if (formData.dni === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El DNI del paciente es obligatorio.'
        });
        return false;
    }
    if (!/^\d+$/.test(formData.dni) || (formData.dni.length !== 7 && formData.dni.length !== 8)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El DNI debe contener solo números y tener 7 u 8 dígitos.'
        });
        return false;
    }

    // Validar Teléfono (solo números y longitud 10)
    if (formData.telefono !== null && formData.telefono !== '') {
        if (!/^\d+$/.test(formData.telefono) || formData.telefono.length !== 10) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El teléfono debe contener solo números y tener 10 dígitos.'
            });
            return false;
        }
    }

    return true;
}

// Enviar formulario de edición de paciente
function enviarFormularioEditarPaciente() {
    // Estado inicial del botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `
        <i class="bi bi-hourglass me-2"></i>
        Guardando...
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const formPacienteData = {
        nombre: formEditarPaciente.nombrePaciente.value.trim(),
        apellido: formEditarPaciente.apellidoPaciente.value.trim(),
        dni: formEditarPaciente.dniPaciente.value.trim(),
        telefono: formEditarPaciente.telefonoPaciente.value.trim() || null,
        correo: formEditarPaciente.correoPaciente.value.trim() || null,
        id_provincia: parseInt(formEditarPaciente.id_provincia.value),
        id_ubicacion_registro: parseInt(formEditarPaciente.ubicacionRegistroPaciente.value)
    };

    if (validarEditarPaciente(formPacienteData)) {
        console.log('Enviando datos actualizados del paciente:', formPacienteData);
        fetch(`/actualizarpaciente/${pacienteId}`, {
            method: 'PUT',
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
                    text: data.message || 'Paciente actualizado correctamente',
                    timer: 2000
                }).then(() => {
                    window.location.href = '/pacientes';
                });
            })
            .catch(error => {
                const mensaje = error.errores?.[0]?.mensaje
                    || error.message
                    || 'Error desconocido al actualizar el paciente';

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