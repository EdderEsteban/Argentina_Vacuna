document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const btnIniciar = document.getElementById('iniciarSesion');
    const btnsolicitud = document.getElementById('solicitud');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    btnIniciar.addEventListener('click', async (e) => {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validación básica
        if (!usuario) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor ingresá tu usuario.'
            });
            return;
        }
        if (!password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor ingresá tu contraseña.'
            });
            return;
        }

        // Deshabilitar botón mientras se procesa
        btnIniciar.disabled = true;
        btnIniciar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Iniciando...
        `;

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ usuario, password })
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: data.message || 'Redirigiendo...',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = data.redirectTo || '/dashboard';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Usuario o contraseña incorrectos.'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al intentar iniciar sesión.'
            });
        } finally {
            btnIniciar.disabled = false;
            btnIniciar.innerHTML = 'Iniciar Sesión';
        }
    });

    btnsolicitud.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/solicitud';
    });
});
