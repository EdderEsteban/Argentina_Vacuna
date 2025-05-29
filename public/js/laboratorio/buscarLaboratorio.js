document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos DOM
    const inputNombre = document.getElementById('inputNombre');
    const inputNacionalidad = document.getElementById('inputNacionalidad');
    const resultados = document.getElementById('resultadosBusqueda');
    const paginacionContainer = document.getElementById('paginacionContainer'); // Contenedor de paginación
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Variables de estado para paginación
    let currentPage = 1;          // Página actual
    let totalPages = 1;            // Total de páginas
    let currentNombre = '';        // Último nombre buscado
    let currentNacionalidad = '';  // Última nacionalidad buscada

    // Función para manejar el borrado de laboratorios
    async function btnBorrarLaboratorio(id, csrfToken) {
        const confirmacion = await Swal.fire({
            title: '¿Borrar laboratorio?',
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
                const response = await fetch(`/borrarlaboratorio/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-Token': csrfToken
                    }
                });

                if (!response.ok) throw new Error('Error en la respuesta del servidor');

                // Actualizar la tabla después de borrar (manteniendo la página actual)
                buscarLaboratorios(currentPage);

                await Swal.fire('¡Borrado!', 'El laboratorio fue eliminado.', 'success');

            } catch (error) {
                console.error('Error al borrar:', error);
                Swal.fire('Error', 'No se pudo eliminar el laboratorio', 'error');
            }
        }
    }

    // Implementación de debounce para optimizar búsquedas
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Función para mostrar estado de carga
    const mostrarCarga = () => {
        resultados.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>`;
        paginacionContainer.innerHTML = ''; // Limpiar paginación durante carga
    };

    // Función principal de búsqueda (ahora con paginación)
    const buscarLaboratorios = async (page = 1) => {
        // Actualizar estado de paginación
        currentPage = page;
        currentNombre = inputNombre.value.trim();
        currentNacionalidad = inputNacionalidad.value.trim();

        // Si ambos campos vacíos, limpiar resultados
        if (!currentNombre && !currentNacionalidad) {
            resultados.innerHTML = '';
            paginacionContainer.innerHTML = '';
            return;
        }

        mostrarCarga();

        try {
            // Preparar parámetros de búsqueda
            const params = new URLSearchParams();
            if (currentNombre) params.append('nombre', currentNombre);
            if (currentNacionalidad) params.append('nacionalidad', currentNacionalidad);
            params.append('page', page); // Enviar página solicitada
            
            // Realizar petición al servidor
            const response = await fetch(`/buscarlaboratorio?${params.toString()}`, {
                headers: { 'X-CSRF-Token': csrfToken }
            });

            // Procesar respuesta
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');
            
            // Actualizar UI con resultados
            actualizarTabla(data.laboratorios);
            actualizarPaginacion(data.pagination);
        } catch (error) {
            console.error('Error:', error);
            resultados.innerHTML = '<tr><td colspan="3">Error en la búsqueda</td></tr>';
            paginacionContainer.innerHTML = '';
        }
    };

    // Función para actualizar tabla con resultados
    const actualizarTabla = (laboratorios) => {
        if (laboratorios.length === 0) {
            resultados.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-4 text-muted">
          <i class="bi bi-search me-2"></i>No se encontraron laboratorios
        </td>
      </tr>`;
            return;
        }

        // Generar filas de la tabla
        resultados.innerHTML = laboratorios.map(lab => `
    <tr>
      <td>${lab.nombre}</td>
      <td>${lab.nacionalidad}</td>
      <td>
        <div class="d-flex gap-2">
          <a href="/editarlaboratorio/${lab.id}" 
             class="btn btn-sm btn-outline-primary">
            <i class="bi bi-pencil"></i>
          </a>
          <button class="btn btn-sm btn-outline-danger borrar-laboratorio" 
                  data-id="${lab.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

        // Agregar event listeners a los nuevos botones de borrar
        document.querySelectorAll('.borrar-laboratorio').forEach(btn => {
            btn.addEventListener('click', async () => {
                await btnBorrarLaboratorio(btn.dataset.id, csrfToken);
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
            <button class="page-link" data-page="${pagination.currentPage + 1}">
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
                buscarLaboratorios(parseInt(btn.dataset.page));
            });
        });
    };

    // Versión con debounce de la búsqueda inicial
    const buscarConDebounce = debounce(() => buscarLaboratorios(1), 300);

    // Event Listeners para búsqueda automática
    inputNombre.addEventListener('input', buscarConDebounce);
    inputNacionalidad.addEventListener('input', buscarConDebounce);

    // Limpiar resultados al vaciar campos
    [inputNombre, inputNacionalidad].forEach(input => {
        input.addEventListener('keyup', () => {
            if (!inputNombre.value.trim() && !inputNacionalidad.value.trim()) {
                resultados.innerHTML = '';
                paginacionContainer.innerHTML = '';
            }
        });
    });

    // Mensaje inicial
    resultados.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-4 text-muted">
        <i class="bi bi-search me-2"></i>Ingrese criterios de búsqueda
      </td>
    </tr>`;
});