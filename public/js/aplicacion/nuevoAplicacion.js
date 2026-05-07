const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const btnRegistrar = document.getElementById('btnRegistrarAplicacion');

// ── Buscar paciente por DNI ──────────────────────────────────────────────────
document.getElementById('btnBuscarPaciente').addEventListener('click', buscarPaciente);
document.getElementById('dniBusqueda').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); buscarPaciente(); }
});

async function buscarPaciente() {
  const dni = document.getElementById('dniBusqueda').value.trim();
  if (!dni) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Ingrese un DNI para buscar.' });
    return;
  }

  try {
    const res = await fetch(`/aplicaciones/buscar-paciente?dni=${encodeURIComponent(dni)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      document.getElementById('id_paciente').value = '';
      document.getElementById('infoPaciente').classList.add('d-none');
      Swal.fire({ icon: 'warning', title: 'No encontrado', text: data.message });
      return;
    }

    const p = data.paciente;
    document.getElementById('id_paciente').value = p.id;
    document.getElementById('nombrePaciente').textContent = `${p.nombre} ${p.apellido}`;
    document.getElementById('datosPaciente').textContent = ` — DNI: ${p.dni}`;
    document.getElementById('infoPaciente').classList.remove('d-none');
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
  }
}

// ── Al seleccionar lote: mostrar info vacuna + cargar ubicaciones ─────────────
document.getElementById('id_lote').addEventListener('change', function () {
  const loteId = this.value;
  if (!loteId) {
    document.getElementById('infoVacuna').classList.add('d-none');
    return;
  }

  // Buscar la opción por valor, no por índice (Select2 puede corromper selectedIndex)
  const opt = this.querySelector(`option[value="${loteId}"]`);
  const tipo = opt ? (opt.dataset.tipo || '') : '';
  const comercial = opt ? (opt.dataset.comercial || '') : '';

  document.getElementById('tipoVacuna').value = tipo;
  document.getElementById('nombreComercial').value = comercial;
  document.getElementById('infoVacuna').classList.toggle('d-none', !tipo && !comercial);
});

// ── Enviar formulario ────────────────────────────────────────────────────────
btnRegistrar.addEventListener('click', async () => {
  const id_paciente = document.getElementById('id_paciente').value;
  const id_lote = document.getElementById('id_lote').value;
  const id_ubicacion = document.getElementById('id_ubicacion').value;
  const fecha_aplicacion = document.getElementById('fecha_aplicacion').value;

  if (!id_paciente) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Debe buscar y seleccionar un paciente.' });
    return;
  }
  if (!id_lote) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Debe seleccionar un lote.' });
    return;
  }
  if (!fecha_aplicacion) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'La fecha de aplicación es obligatoria.' });
    return;
  }

  btnRegistrar.disabled = true;
  btnRegistrar.innerHTML = '<i class="bi bi-hourglass me-2"></i>Registrando... <span class="spinner-border spinner-border-sm"></span>';

  try {
    const res = await fetch('/crearaplicacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ id_paciente, id_lote, id_ubicacion, fecha_aplicacion })
    });

    const data = await res.json();

    if (data.vencida) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Alerta importante',
        html: `<p class="text-danger fw-bold">${data.message}</p>`,
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!res.ok || !data.success) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message });
      return;
    }

    await Swal.fire({ icon: 'success', title: '¡Registrado!', text: data.message, timer: 2000 });
    window.location.href = '/aplicaciones';

  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.innerHTML = '<i class="bi bi-save me-2"></i>Registrar Aplicación';
  }
});
