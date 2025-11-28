document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formMovimiento');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/crearmovimiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire('Éxito', result.message, 'success').then(() => {
          window.location.href = '/movimientos';
        });
      } else {
        Swal.fire('Error', result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al registrar el movimiento', 'error');
    }
  });
});