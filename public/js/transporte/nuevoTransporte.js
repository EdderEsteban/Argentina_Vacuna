document.addEventListener('DOMContentLoaded', () => {
  const csrfToken = document.querySelector('input[name="_csrf"]').value;
  const btnRegistrar = document.getElementById('btnRegistrar');

  btnRegistrar.addEventListener('click', async () => {
    const nombre  = document.getElementById('nombre').value.trim();
    const id_movil = document.getElementById('id_movil').value.trim();

    if (!nombre)   return Swal.fire('Campo requerido', 'Ingresá el nombre de la empresa', 'warning');
    if (!id_movil) return Swal.fire('Campo requerido', 'Ingresá el identificador del móvil', 'warning');

    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML = '<i class="bi bi-hourglass me-1"></i>Registrando...';

    try {
      const res = await fetch('/creartransporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ nombre, id_movil })
      });
      const data = await res.json();

      if (!res.ok) throw data;
      await Swal.fire('Registrado', data.message, 'success');
      window.location.href = '/transportes';
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo registrar el transporte', 'error');
    } finally {
      btnRegistrar.disabled = false;
      btnRegistrar.innerHTML = '<i class="bi bi-check-circle me-1"></i>Registrar Transporte';
    }
  });
});
