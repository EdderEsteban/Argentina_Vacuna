document.getElementById('formBuscarAplicacion').addEventListener('submit', async function (e) {
  e.preventDefault();
  await buscar(1);
});

// Ejecuta la búsqueda de aplicaciones con los filtros del formulario y renderiza los resultados paginados
async function buscar(page) {
  const dni = document.getElementById('dniBuscar').value.trim();
  const id_ubicacion = document.getElementById('id_ubicacion').value;
  const fecha_desde = document.getElementById('fecha_desde').value;
  const fecha_hasta = document.getElementById('fecha_hasta').value;

  const params = new URLSearchParams({ page });
  if (dni) params.append('dni', dni);
  if (id_ubicacion) params.append('id_ubicacion', id_ubicacion);
  if (fecha_desde) params.append('fecha_desde', fecha_desde);
  if (fecha_hasta) params.append('fecha_hasta', fecha_hasta);

  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = '<div class="text-center my-4"><span class="spinner-border"></span></div>';

  try {
    const res = await fetch(`/buscaraplicacion?${params}`);
    const data = await res.json();

    if (!res.ok) {
      contenedor.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      return;
    }

    if (data.aplicaciones.length === 0) {
      contenedor.innerHTML = '<div class="alert alert-info">No se encontraron aplicaciones con los filtros indicados.</div>';
      return;
    }

    let html = `
      <p class="text-muted">Se encontraron <strong>${data.pagination.totalItems}</strong> resultado(s)</p>
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th>Fecha</th><th>Paciente</th><th>DNI</th>
              <th>Lote</th><th>Tipo Vacuna</th><th>Centro</th><th>Enfermero</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.aplicaciones.forEach(a => {
      const tipo = (a.lote?.vacunas?.length > 0) ? a.lote.vacunas[0].tipo : '—';
      html += `
        <tr>
          <td>${a.fecha_aplicacion}</td>
          <td>${a.paciente ? `${a.paciente.nombre} ${a.paciente.apellido}` : '—'}</td>
          <td>${a.paciente?.dni || '—'}</td>
          <td>${a.lote?.num_lote || '—'}</td>
          <td>${tipo}</td>
          <td>${a.ubicacion?.nombre || '—'}</td>
          <td>${a.usuario ? `${a.usuario.nombre} ${a.usuario.apellido}` : '—'}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';

    // Paginación
    if (data.pagination.totalPages > 1) {
      html += '<ul class="pagination justify-content-center mt-3">';
      html += `<li class="page-item ${data.pagination.hasPreviousPage ? '' : 'disabled'}">
        <a class="page-link" href="#" onclick="buscar(${data.pagination.currentPage - 1}); return false;">&laquo;</a></li>`;
      for (let i = 1; i <= data.pagination.totalPages; i++) {
        html += `<li class="page-item ${i === data.pagination.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="buscar(${i}); return false;">${i}</a></li>`;
      }
      html += `<li class="page-item ${data.pagination.hasNextPage ? '' : 'disabled'}">
        <a class="page-link" href="#" onclick="buscar(${data.pagination.currentPage + 1}); return false;">&raquo;</a></li>`;
      html += '</ul>';
    }

    contenedor.innerHTML = html;
  } catch {
    contenedor.innerHTML = '<div class="alert alert-danger">Error al conectar con el servidor.</div>';
  }
}
