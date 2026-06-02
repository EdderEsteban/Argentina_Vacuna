document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('input[name="_csrf"]').value;

  // ── Guardar datos de contacto (correo + teléfono) ──
  document.getElementById('btnGuardarContacto').addEventListener('click', async () => {
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!correo) {
      return Swal.fire('Campo requerido', 'El correo electrónico es obligatorio.', 'warning');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return Swal.fire('Correo inválido', 'Ingresá una dirección de correo válida.', 'warning');
    }

    try {
      const res = await fetch('/mi-cuenta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ correo, telefono })
      });
      const data = await res.json();
      if (res.ok) Swal.fire('Guardado', data.message, 'success');
      else Swal.fire('Error', data.message || 'No se pudieron guardar los cambios.', 'error');
    } catch (err) {
      Swal.fire('Error', 'Falló la conexión.', 'error');
    }
  });

  // ── Cambiar contraseña propia ──
  document.getElementById('btnCambiarPassword').addEventListener('click', async () => {
    const actual = document.getElementById('actual').value;
    const nueva = document.getElementById('nueva').value;
    const confirmar = document.getElementById('confirmar').value;

    if (!actual || !nueva || !confirmar) {
      return Swal.fire('Campos incompletos', 'Completá los tres campos de contraseña.', 'warning');
    }
    if (nueva.length < 8) {
      return Swal.fire('Contraseña corta', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
    }
    if (nueva !== confirmar) {
      return Swal.fire('No coincide', 'La confirmación no coincide con la nueva contraseña.', 'warning');
    }

    try {
      const res = await fetch('/mi-cuenta/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ actual, nueva, confirmar })
      });
      const data = await res.json();
      if (res.ok) {
        await Swal.fire('Listo', data.message, 'success');
        document.getElementById('formPassword').reset();
      } else {
        Swal.fire('Error', data.message || 'No se pudo cambiar la contraseña.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Falló la conexión.', 'error');
    }
  });
});
