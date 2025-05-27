// -----------------------------------Variables-------------------------------------------------
const formNuevoLaboratorio = document.getElementById('formNuevoLaboratorio');
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// -----------------------------------Botones de acción-----------------------------------------
// Boton para guardar nuevo laboratorio
document.getElementById('guardarNuevoLaboratorio').addEventListener('click', function (event) {
    event.preventDefault();
    enviarFormularioNuevoLaboratorio();
});

// Boton para cancelar nuevo laboratorio
document.getElementById('cancelarNuevoLaboratorio').addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = '/laboratorios'; 
});

// ----------------------------------Funciones-------------------------------------------------
// Validar campos del formulario de nuevo laboratorio
function validarNuevoLaboratorio(formData) {
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
function enviarFormularioNuevoLaboratorio() {

    // Crear objeto con los datos del formulario
    const formLaboratorioData = {
        nombre: formNuevoLaboratorio.nombreLaboratorio.value.trim(),
        nacionalidad: formNuevoLaboratorio.nacionalidadLaboratorio.value.trim()
    };
    // Validar los datos del formulario
    if (validarNuevoLaboratorio(formLaboratorioData)) {

        fetch('/crearlaboratorio', {
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
                text: data.message || 'Laboratorio creado correctamente'
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
        });
    }
}