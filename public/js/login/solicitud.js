document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formSolicitud');
  const btnEnviar = document.getElementById('btnEnviarSolicitud');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni      = document.getElementById('dni').value.trim();
    const usuario  = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const correo   = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const motivo   = document.getElementById('motivo').value.trim();

    if (!nombre || !apellido || !dni || !usuario || !password || !confirm || !correo || !telefono || !motivo) {
      return Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completá todos los campos obligatorios.' });
    }
    if (!/^\d{7,8}$/.test(dni)) {
      return Swal.fire({ icon: 'warning', title: 'DNI inválido', text: 'El DNI debe tener 7 u 8 dígitos numéricos.' });
    }
    if (usuario.length < 4 || usuario.length > 50 || /\s/.test(usuario)) {
      return Swal.fire({ icon: 'warning', title: 'Usuario inválido', text: 'El usuario debe tener entre 4 y 50 caracteres y no puede tener espacios.' });
    }
    if (password.length < 8) {
      return Swal.fire({ icon: 'warning', title: 'Contraseña débil', text: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (password !== confirm) {
      return Swal.fire({ icon: 'warning', title: 'Contraseñas distintas', text: 'La contraseña y su confirmación no coinciden.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return Swal.fire({ icon: 'warning', title: 'Correo inválido', text: 'Ingresá un correo electrónico válido.' });
    }
    if (motivo.length < 10) {
      return Swal.fire({ icon: 'warning', title: 'Motivo muy corto', text: 'El motivo debe tener al menos 10 caracteres.' });
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    try {
      const res = await fetch('/nuevaSolicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ nombre, apellido, dni, usuario, password, correo, telefono, motivo })
      });

      const result = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: 'Tu solicitud fue recibida correctamente. Un administrador la revisará a la brevedad.',
          timer: 3000,
          showConfirmButton: false
        });
        window.location.href = '/';
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'Hubo un problema al enviar la solicitud.' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<i class="bi bi-send me-2"></i>Enviar Solicitud';
    }
  });
});
