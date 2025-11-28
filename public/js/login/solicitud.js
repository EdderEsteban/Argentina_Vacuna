document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formSolicitud');
    const btnEnviar = document.getElementById('btnEnviarSolicitud');
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            motivo: document.getElementById('motivo').value.trim()
        };

        // Validación simple
        if (!data.nombre || !data.apellido || !data.dni || !data.correo || !data.telefono ||!data.motivo) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan campos',
                text: 'Por favor completá todos los campos obligatorios.'
            });
            return;
        }
        if (data.motivo.length < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan campos',
                text: 'El motivo debe tener al menos 10 caracteres.'
            });
            return;
        };

        // Deshabilitar botón
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Enviando...
        `;

        try {
            const res = await fetch('/nuevaSolicitud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            console.log(result);

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Solicitud enviada',
                    text: result.message || 'Tu solicitud fue recibida correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Hubo un problema al enviar la solicitud.'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar con el servidor.'
            });
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = 'Enviar Solicitud';
        }
    });
});