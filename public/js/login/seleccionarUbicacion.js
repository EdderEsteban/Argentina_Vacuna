const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btn = document.getElementById('btnConfirmar');

// Selección al hacer click en la card o en el radio
document.querySelectorAll('.ubicacion-card').forEach(card => {
  card.addEventListener('click', () => {
    const radio = card.querySelector('input[type="radio"]');
    radio.checked = true;
    resaltarSeleccion(card);
    btn.disabled = false;
  });
});

function resaltarSeleccion(cardActiva) {
  document.querySelectorAll('.ubicacion-card').forEach(c => {
    c.classList.remove('border-primary', 'bg-primary', 'text-white');
    c.style.borderWidth = '';
  });
  cardActiva.classList.add('border-primary');
  cardActiva.style.borderWidth = '2px';
}

btn.addEventListener('click', async () => {
  const selected = document.querySelector('input[name="id_ubicacion"]:checked');
  if (!selected) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirmando...';

  try {
    const res = await fetch('/seleccionar-ubicacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ id_ubicacion: selected.value })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = data.redirectTo || '/dashboard';
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message });
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirmar Ubicación';
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirmar Ubicación';
  }
});
