const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnRegistrar = document.getElementById('btnRegistrarDescarte');
const selectUbicacion = document.getElementById('id_ubicacion');
const inputCantidad = document.getElementById('cantidad');
const stockInfo = document.getElementById('stockDisponible');

// ── Al seleccionar lote: mostrar info vacuna + cargar ubicaciones ─────────────
document.getElementById('id_lote').addEventListener('change', async function () {
  const loteId = this.value;
  if (!loteId) return;

  const opt = this.options[this.selectedIndex];
  const tipo = opt.dataset.tipo || '';
  const comercial = opt.dataset.comercial || '';

  document.getElementById('tipoVacuna').value = tipo;
  document.getElementById('nombreComercial').value = comercial;
  document.getElementById('infoVacuna').classList.toggle('d-none', !tipo && !comercial);

  // Reset ubicación y cantidad
  selectUbicacion.innerHTML = '<option value="" disabled selected>Cargando...</option>';
  selectUbicacion.disabled = true;
  inputCantidad.value = '';
  inputCantidad.disabled = true;
  inputCantidad.removeAttribute('max');
  stockInfo.textContent = '';

  try {
    const res = await fetch(`/descartes/ubicaciones/${loteId}`);
    const ubicaciones = await res.json();

    selectUbicacion.innerHTML = '<option value="" disabled selected>-- Seleccione una ubicación --</option>';

    if (ubicaciones.length === 0) {
      selectUbicacion.innerHTML = '<option value="" disabled selected>Sin stock disponible</option>';
      return;
    }

    ubicaciones.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.nombre} (${u.tipo}) — stock: ${u.stock}`;
      opt.dataset.stock = u.stock;
      selectUbicacion.appendChild(opt);
    });

    selectUbicacion.disabled = false;
  } catch {
    selectUbicacion.innerHTML = '<option value="" disabled selected>Error al cargar ubicaciones</option>';
  }
});

// ── Al seleccionar ubicación: habilitar cantidad con máximo ──────────────────
selectUbicacion.addEventListener('change', function () {
  const opt = this.options[this.selectedIndex];
  const stockMax = parseInt(opt.dataset.stock) || 0;

  inputCantidad.max = stockMax;
  inputCantidad.disabled = false;
  inputCantidad.value = '';
  stockInfo.textContent = `Stock disponible en esta ubicación: ${stockMax} dosis`;
});

// ── Enviar formulario ────────────────────────────────────────────────────────
btnRegistrar.addEventListener('click', async () => {
  const id_lote = document.getElementById('id_lote').value;
  const id_ubicacion = selectUbicacion.value;
  const cantidad = inputCantidad.value;
  const fecha_descarte = document.getElementById('fecha_descarte').value;
  const forma_descarte = document.getElementById('forma_descarte').value;
  const motivo = document.getElementById('motivo').value.trim();

  // Validaciones frontend
  if (!id_lote) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Debe seleccionar un lote.' });
    return;
  }
  if (!cantidad || parseInt(cantidad) < 1) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'La cantidad debe ser mayor a cero.' });
    return;
  }
  if (inputCantidad.max && parseInt(cantidad) > parseInt(inputCantidad.max)) {
    Swal.fire({ icon: 'error', title: 'Error', text: `La cantidad no puede superar el stock disponible (${inputCantidad.max}).` });
    return;
  }
  if (!forma_descarte) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Debe seleccionar la forma de descarte.' });
    return;
  }
  if (motivo.length < 10) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'El motivo debe tener al menos 10 caracteres.' });
    return;
  }

  // Confirmación antes de registrar (es una acción destructiva)
  const confirmacion = await Swal.fire({
    icon: 'warning',
    title: '¿Confirmar descarte?',
    html: `Se registrará el descarte de <strong>${cantidad} dosis</strong> del lote.<br>Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, descartar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacion.isConfirmed) return;

  btnRegistrar.disabled = true;
  btnRegistrar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Registrando... <span class="spinner-border spinner-border-sm"></span>';

  try {
    const res = await fetch('/creardescarte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ id_lote, id_ubicacion, cantidad, fecha_descarte, forma_descarte, motivo })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message });
      return;
    }

    await Swal.fire({ icon: 'success', title: '¡Registrado!', text: data.message, timer: 2000 });
    window.location.href = '/descartes';

  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.innerHTML = '<i class="bi bi-trash me-2"></i>Registrar Descarte';
  }
});
