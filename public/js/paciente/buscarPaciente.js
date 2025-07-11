document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos DOM
    const inputDNI = document.getElementById('inputDNI');
    const inputNombre = document.getElementById('inputNombre');
    const inputApellido = document.getElementById('inputApellido');
    const inputProvincia = document.getElementById('id_provincia');
    const inputUbicacion = document.getElementById('id_ubicacion');
    const resultados = document.getElementById('resultadosBusqueda');
    const paginacionContainer = document.getElementById('paginacionContainer');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Variables de estado para paginación
    let currentPage = 1;
    let totalPages = 1;

    // Función para validar que al menos un campo de búsqueda esté lleno
    const validarCamposBusqueda = () => {
        const currentDNI = inputDNI.value.trim();
        const currentNombre = inputNombre.value.trim();
        const currentApellido = inputApellido.value.trim();
        const currentProvincia = inputProvincia.value;
        const currentUbicacion = inputUbicacion.value;

        if (!currentDNI && !currentNombre && !currentApellido && !currentProvincia && !currentUbicacion) {
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
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>`;
        paginacionContainer.innerHTML = '';
    };

    // Función principal de búsqueda (ahora con paginación)
    const buscarPacientes = async (page = 1) => {
        currentPage = page;
        const currentDNI = inputDNI.value.trim();
        const currentNombre = inputNombre.value.trim();
        const currentApellido = inputApellido.value.trim();
        const currentProvincia = inputProvincia.value;
        const currentUbicacion = inputUbicacion.value;

        if (!validarCamposBusqueda()) {
            return;
        }

        mostrarCarga();

        try {
            const params = new URLSearchParams();
            if (currentDNI) params.append('dni', currentDNI);
            if (currentNombre) params.append('nombre', currentNombre);
            if (currentApellido) params.append('apellido', currentApellido);
            if (currentProvincia) params.append('id_provincia', currentProvincia);
            if (currentUbicacion) params.append('id_ubicacion_registro', currentUbicacion);
            params.append('page', page);

            const response = await fetch(`/buscarpaciente?${params.toString()}`, {
                headers: { 'X-CSRF-Token': csrfToken }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');

            actualizarTabla(data.pacientes);
            actualizarPaginacion(data.pagination);

        } catch (error) {
            console.error('Error:', error);
            resultados.innerHTML = '<tr><td colspan="8">Error en la búsqueda</td></tr>';
            paginacionContainer.innerHTML = '';
        }
    };

    // Función para actualizar tabla con resultados
    const actualizarTabla = (pacientes) => {
        if (pacientes.length === 0) {
            resultados.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-search me-2"></i>No se encontraron pacientes
                    </td>
                </tr>`;
            return;
        }

        resultados.innerHTML = pacientes.map(paciente => {
            return `
                <tr>
                    <td>${paciente.dni}</td>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.apellido}</td>
                    <td>${paciente.provincia.nombre}</td>
                    <td>${paciente.ubicacionRegistro.nombre}</td>
                    <td>${paciente.telefono || 'No especificado'}</td>
                    <td>${paciente.correo || 'No especificado'}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <a href="/editarpaciente/${paciente.id}" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <a href="/detallespaciente/${paciente.id}" class="btn btn-sm btn-outline-info">
                                <i class="bi bi-journal-medical"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Agregar listener para el botón Ver Vacunas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ver-vacunas') || e.target.parentElement.classList.contains('ver-vacunas')) {
                e.preventDefault();
                const btn = e.target.classList.contains('ver-vacunas') ? e.target : e.target.parentElement;
                const pacienteId = btn.dataset.id;

                window.location.href = `/detallespaciente/${pacienteId}`;
            }
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
                    buscarPacientes(page);
                }
            });
        });
    };

    // Event Listener para el botón de búsqueda
    btnBuscar.addEventListener('click', () => {
        buscarPacientes(1);
    });

    // Event Listener para el botón de limpiar
    btnLimpiar.addEventListener('click', () => {
        inputDNI.value = '';
        inputNombre.value = '';
        inputApellido.value = '';
       
        // Actualizar Select2 manualmente
        $(inputProvincia).val('').trigger('change');
        $(inputUbicacion).val('').trigger('change');

        resultados.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
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
                buscarPacientes(page);
            }
        }
    });

    // Mensaje inicial
    resultados.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4 text-muted">
                <i class="bi bi-search me-2"></i>Ingrese criterios de búsqueda
            </td>
        </tr>`;
});