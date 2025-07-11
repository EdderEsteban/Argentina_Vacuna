document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos DOM
    const inputNombre = document.getElementById('inputNombre');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputProvincia = document.getElementById('id_provincia');
    const inputTipo = document.getElementById('tipo');
    const resultados = document.getElementById('resultadosBusqueda');
    const paginacionContainer = document.getElementById('paginacionContainer');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Variables de estado para paginación
    let currentPage = 1;
    let totalPages = 1;

    // Inicializar Select2 para los selects
    function inicializarSelect2() {
        $(inputProvincia).select2({
            placeholder: 'Seleccione una provincia',
            allowClear: true,
            width: '100%',
            dropdownParent: $(inputProvincia).parent()
        });

        $(inputTipo).select2({
            placeholder: 'Seleccione un tipo de ubicación',
            allowClear: true,
            width: '100%',
            dropdownParent: $(inputTipo).parent()
        });
    }

    // Función para validar que al menos un campo de búsqueda esté lleno
    const validarCamposBusqueda = () => {
        const currentNombre = inputNombre.value.trim();
        const currentTelefono = inputTelefono.value.trim();
        const currentProvincia = inputProvincia.value;
        const currentTipo = inputTipo.value;

        if (!currentNombre && !currentTelefono && !currentProvincia && !currentTipo) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan criterios de búsqueda',
                text: 'Por favor, ingrese al menos un criterio de búsqueda.',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        return true;
    };

    // Función para mostrar estado de carga
    const mostrarCarga = () => {
        resultados.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>`;
        paginacionContainer.innerHTML = '';
    };

    // Función principal de búsqueda (ahora con paginación)
    const buscarUbicaciones = async (page = 1) => {
        currentPage = page;
        const currentNombre = inputNombre.value.trim();
        const currentTelefono = inputTelefono.value.trim();
        const currentProvincia = inputProvincia.value;
        const currentTipo = inputTipo.value;

        if (!validarCamposBusqueda()) {
            return;
        }

        mostrarCarga();

        try {
            const params = new URLSearchParams();
            if (currentNombre) params.append('nombre', currentNombre);
            if (currentTelefono) params.append('telefono', currentTelefono);
            if (currentProvincia) params.append('id_provincia', currentProvincia);
            if (currentTipo) params.append('tipo', currentTipo);
            params.append('page', page);

            const response = await fetch(`/buscarubicacion?${params.toString()}`, {
                headers: { 'X-CSRF-Token': csrfToken }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la búsqueda');
            }

            actualizarTabla(data.ubicaciones);
            actualizarPaginacion(data.pagination);

        } catch (error) {
            console.error('Error:', error);
            resultados.innerHTML = '<tr><td colspan="6">Error en la búsqueda</td></tr>';
            paginacionContainer.innerHTML = '';
        }
    };

    // Función para actualizar tabla con resultados
    const actualizarTabla = (ubicaciones) => {
        if (ubicaciones.length === 0) {
            resultados.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="bi bi-search me-2"></i>No se encontraron ubicaciones
                    </td>
                </tr>`;
            return;
        }

        resultados.innerHTML = ubicaciones.map(ubicacion => {
            return `
                <tr>
                    <td>${ubicacion.nombre}</td>
                    <td>${ubicacion.direccion}</td>
                    <td>${ubicacion.telefono}</td>
                    <td>${ubicacion.provincia.nombre}</td>
                    <td>${ubicacion.tipo}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <a href="/editarubicacion/${ubicacion.id}" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <button class="btn btn-sm btn-outline-danger borrar-ubicacion" data-id="${ubicacion.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Agregar listener para los botones de borrar ubicación
        document.querySelectorAll('.borrar-ubicacion').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const ubicacionId = btn.dataset.id;
                const borrarUbicacion = async (id) => {
                    const result = await Swal.fire({
                        title: '¿Estás seguro?',
                        text: 'Esta acción no se puede deshacer.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, borrar',
                        cancelButtonText: 'Cancelar'
                    });

                    if (result.isConfirmed) {
                        try {
                            const res = await fetch(`/borrarubicacion/${id}`, {
                                method: 'DELETE',
                                headers: { 'X-CSRF-Token': csrfToken }
                            });

                            if (res.ok) {
                                Swal.fire('¡Borrado!', 'La ubicación fue eliminada.', 'success');
                                buscarUbicaciones(currentPage); 
                            } else {
                                const data = await res.json();
                                Swal.fire('Error', data.message || 'No se pudo borrar la ubicación.', 'error');
                            }
                        } catch (err) {
                            Swal.fire('Error', 'Hubo un problema al intentar borrar.', 'error');
                        }
                    }
                };

                borrarUbicacion(ubicacionId);
            });
        });
    };

    // Función para generar controles de paginación
    const actualizarPaginacion = (pagination) => {
        totalPages = pagination.totalPages;

        if (totalPages <= 1) {
            paginacionContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <nav aria-label="Paginación">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
                        <button class="page-link" data-page="${pagination.currentPage - 1}">
                            &laquo; Anterior
                        </button>
                    </li>`;

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                    <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                        <button class="page-link" data-page="${i}">${i}</button>
                    </li>`;
        }

        paginationHTML += `
                    <li class="page-item ${pagination.currentPage === totalPages ? 'disabled' : ''}">
                        <button class="page-link" data-page="${pagination.currentPage + 1}">
                            Siguiente &raquo;
                        </button>
                    </li>
                </ul>
            </nav>`;

        paginacionContainer.innerHTML = paginationHTML;

        document.querySelectorAll('.page-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(btn.dataset.page);
                if (page) {
                    buscarUbicaciones(page);
                }
            });
        });
    };

    // Event Listener para el botón de búsqueda
    btnBuscar.addEventListener('click', () => {
        buscarUbicaciones(1);
    });

    // Event Listener para el botón de limpiar
    btnLimpiar.addEventListener('click', () => {
        inputNombre.value = '';
        inputTelefono.value = '';
        $(inputProvincia).val('').trigger('change');
        $(inputTipo).val('').trigger('change');

        resultados.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-search me-2"></i>Ingrese criterios de búsqueda
                </td>
            </tr>`;
        paginacionContainer.innerHTML = '';
    });

    // Event Listener para los botones de paginación
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page) {
                buscarUbicaciones(page);
            }
        }
    });

    // Inicializar Select2
    inicializarSelect2();

    // Mensaje inicial
    resultados.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-search me-2"></i>Ingrese criterios de búsqueda
            </td>
        </tr>`;
});