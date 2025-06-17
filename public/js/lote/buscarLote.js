document.addEventListener('DOMContentLoaded', () => {
  // Obtener elementos DOM
  const inputNumLote = document.getElementById('inputNumLote');
  const inputLaboratorio = document.getElementById('id_laboratorio');
  const inputFechaCompraMes = document.getElementById('inputFechaCompraMes');
  const inputFechaCompraAnno = document.getElementById('inputFechaCompraAnno');
  const inputFechaVencMes = document.getElementById('inputFechaVencMes');
  const inputFechaVencAnno = document.getElementById('inputFechaVencAnno');
  const resultados = document.getElementById('resultadosBusqueda');
  const paginacionContainer = document.getElementById('paginacionContainer');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const btnBuscar = document.getElementById('btnBuscar');
  const btnLimpiar = document.getElementById('btnLimpiar');

  // Variables de estado para paginación
  let currentPage = 1;
  let totalPages = 1;
  let select2Instance = null; // Almacenar la instancia de select2

  // Función para manejar el borrado de lotes
  async function btnBorrarLote(id, csrfToken) {
    const confirmacion = await Swal.fire({
      title: '¿Borrar lote?',
      text: "¡Esta acción no se puede revertir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const response = await fetch(`/borrarlote/${id}`, {
          method: 'DELETE',
          headers: {
            'X-CSRF-Token': csrfToken
          }
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        // Actualizar la tabla después de borrar (manteniendo la página actual)
        buscarLotes(currentPage);

        await Swal.fire('¡Borrado!', 'El lote fue eliminado.', 'success');

      } catch (error) {
        console.error('Error al borrar:', error);
        Swal.fire('Error', 'No se pudo eliminar el lote', 'error');
      }
    }
  }

  // Función para mostrar estado de carga
  const mostrarCarga = () => {
    resultados.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>`;
    paginacionContainer.innerHTML = ''; // Limpiar paginación durante carga
  };

  // Función para validar que si se selecciona un mes, se ingrese el año correspondiente
  const validarCamposBusqueda = () => {
    let valid = true;
    let mensaje = '';

    if (!inputNumLote.value.trim() && !inputLaboratorio.value && !inputFechaCompraMes.value && !inputFechaCompraAnno.value.trim() && !inputFechaVencMes.value && !inputFechaVencAnno.value.trim()) {
      valid = false;
      mensaje = 'Por favor, ingrese al menos un criterio de búsqueda.';
      Swal.fire({
        icon: 'warning',
        title: 'Faltan criterios de búsqueda',
        text: mensaje,
        confirmButtonText: 'Aceptar'
      });
    }

    if (inputFechaCompraMes.value && !inputFechaCompraAnno.value) {
      valid = false;
      mensaje = 'Por favor, ingrese el año de compra.';
      Swal.fire({
        icon: 'warning',
        title: 'Falta el año de compra',
        text: mensaje,
        confirmButtonText: 'Aceptar'
      });
    }

    if (inputFechaVencMes.value && !inputFechaVencAnno.value) {
      valid = false;
      mensaje = 'Por favor, ingrese el año de vencimiento.';
      Swal.fire({
        icon: 'warning',
        title: 'Falta el año de vencimiento',
        text: mensaje,
        confirmButtonText: 'Aceptar'
      });
    }

    if (!valid) return false;

    return inputNumLote.value.trim() || inputLaboratorio.value || inputFechaCompraMes.value || inputFechaCompraAnno.value.trim() || inputFechaVencMes.value || inputFechaVencAnno.value.trim();
  };

  // Función principal de búsqueda (ahora con paginación)
  const buscarLotes = async (page = 1) => {
    // Actualizar estado de paginación
    currentPage = page;
    const currentNumLote = inputNumLote.value.trim();
    const currentLaboratorio = inputLaboratorio.value;
    const currentFechaCompraMes = inputFechaCompraMes.value;
    const currentFechaCompraAnno = inputFechaCompraAnno.value.trim();
    const currentFechaVencMes = inputFechaVencMes.value;
    const currentFechaVencAnno = inputFechaVencAnno.value.trim();

    // Validar al menos un campo de búsqueda
    if (!validarCamposBusqueda()) {
      return;
    }

    // Mostrar resultados incluso si algunos campos están vacíos
    mostrarCarga();

    try {
      // Preparar parámetros de búsqueda
      const params = new URLSearchParams();
      if (currentNumLote) params.append('numLote', currentNumLote);
      if (currentLaboratorio) params.append('id_laboratorio', currentLaboratorio);
      if (currentFechaCompraMes && currentFechaCompraAnno) {
        params.append('fecha_compra', `${currentFechaCompraAnno}-${currentFechaCompraMes.padStart(2, '0')}`);
      }
      if (currentFechaVencMes && currentFechaVencAnno) {
        params.append('fecha_venc', `${currentFechaVencAnno}-${currentFechaVencMes.padStart(2, '0')}`);
      }
      params.append('page', page); // Enviar página solicitada

      // Realizar petición al servidor
      const response = await fetch(`/buscarlote?${params.toString()}`, {
        headers: { 'X-CSRF-Token': csrfToken }
      });

      // Procesar respuesta
      const data = await response.json();

      console.log('Respuesta del servidor:', data);

      if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');

      // Actualizar UI con resultados
      actualizarTabla(data.lotes);
      actualizarPaginacion(data.pagination);
    } catch (error) {
      console.error('Error:', error);
      resultados.innerHTML = '<tr><td colspan="7">Error en la búsqueda</td></tr>';
      paginacionContainer.innerHTML = '';
    }
  };

  // Función para actualizar tabla con resultados
  const actualizarTabla = (lotes) => {
    if (lotes.length === 0) {
      resultados.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          <i class="bi bi-search me-2"></i>No se encontraron lotes
        </td>
      </tr>`;
      return;
    }

    // Generar filas de la tabla
    resultados.innerHTML = lotes.map(lote => `
    <tr>
      <td>${lote.num_lote}</td>
      <td>${lote.laboratorio.nombre}</td>
      <td>${lote.cantidad}</td>
      <td>${lote.fecha_compra}</td>
      <td>${lote.fecha_fab}</td>
      <td>${lote.fecha_venc}</td>
      <td>
        <div class="d-flex gap-2">
          <a href="/editarlote/${lote.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-pencil"></i>
          </a>
          <button class="btn btn-sm btn-outline-danger borrar-lote" data-id="${lote.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

    // Agregar event listeners a los nuevos botones de borrar
    document.querySelectorAll('.borrar-lote').forEach(btn => {
      btn.addEventListener('click', async () => {
        await btnBorrarLote(btn.dataset.id, csrfToken);
      });
    });
  };

  // Función para generar controles de paginación
  const actualizarPaginacion = (pagination) => {
    totalPages = pagination.totalPages;

    // Ocultar paginación si solo hay una página
    if (totalPages <= 1) {
      paginacionContainer.innerHTML = '';
      return;
    }

    // Generar HTML de paginación
    let paginationHTML = `
      <nav aria-label="Paginación">
        <ul class="pagination justify-content-center">
          <!-- Botón Anterior -->
          <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="${pagination.currentPage - 1}">
              &laquo; Anterior
            </button>
          </li>`;

    // Generar números de página
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
          <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
            <button class="page-link" data-page="${i}">${i}</button>
          </li>`;
    }

    // Botón Siguiente
    paginationHTML += `
          <li class="page-item ${pagination.currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="${pagination.currentPage + 1}>
              Siguiente &raquo;
            </button>
          </li>
        </ul>
      </nav>`;

    paginacionContainer.innerHTML = paginationHTML;

    // Agregar event listeners a los botones de paginación
    document.querySelectorAll('.page-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buscarLotes(parseInt(btn.dataset.page));
      });
    });
  };

  // Event Listener para el botón de búsqueda
  btnBuscar.addEventListener('click', () => {
    buscarLotes(1);
  });

  // Event Listener para el botón de limpiar
  btnLimpiar.addEventListener('click', () => {
    // Limpiar campos
    inputNumLote.value = '';
    inputLaboratorio.value = '';
    inputFechaCompraMes.value = '';
    inputFechaCompraAnno.value = '';
    inputFechaVencMes.value = '';
    inputFechaVencAnno.value = '';
    inputFechaCompraAnno.classList.remove('is-invalid');
    inputFechaVencAnno.classList.remove('is-invalid');

    // Limpiar y resetear select2
    if (select2Instance) {
      select2Instance.val(null).trigger('change'); // Limpia y actualiza select2
    }

    // Limpiar resultados y paginación
    resultados.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">
              <i class="bi bi-search me-2></i>Ingrese criterios de búsqueda
            </td>
          </tr>`;
    paginacionContainer.innerHTML = '';
  });

  // Agregar validación para los campos de mes
  inputFechaCompraMes.addEventListener('change', () => {
    if (inputFechaCompraMes.value && !inputFechaCompraAnno.value) {
      inputFechaCompraAnno.classList.add('is-invalid');
    } else {
      inputFechaCompraAnno.classList.remove('is-invalid');
    }
  });

  inputFechaVencMes.addEventListener('change', () => {
    if (inputFechaVencMes.value && !inputFechaVencAnno.value) {
      inputFechaVencAnno.classList.add('is-invalid');
    } else {
      inputFechaVencAnno.classList.remove('is-invalid');
    }
  });

  // Agregar validación para los campos de año
  inputFechaCompraAnno.addEventListener('input', () => {
    if (inputFechaCompraAnno.value.trim()) {
      inputFechaCompraAnno.classList.remove('is-invalid');
    }
  });

  inputFechaVencAnno.addEventListener('input', () => {
    if (inputFechaVencAnno.value.trim()) {
      inputFechaVencAnno.classList.remove('is-invalid');
    }
  });

  // Inicializar select2 y guardar la instancia
  if (inputLaboratorio) {
    select2Instance = $(inputLaboratorio).select2({
      placeholder: 'Seleccione un laboratorio',
      allowClear: true,
      width: '100%',
      dropdownParent: $(inputLaboratorio).parent()
    });
  }

  // Mensaje inicial
  resultados.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4 text-muted">
        <i class="bi bi-search me-2"></i>Ingrese criterios de búsqueda
      </td>
    </tr>`;

});