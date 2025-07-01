document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos DOM
    const inputNumLote = document.getElementById('inputNumLote');
    const inputLaboratorio = document.getElementById('id_laboratorio');
    const inputFechaCompraMes = document.getElementById('inputFechaCompraMes');
    const inputFechaCompraAnno = document.getElementById('inputFechaCompraAnno');
    const inputFechaVencMes = document.getElementById('inputFechaVencMes');
    const inputFechaVencAnno = document.getElementById('inputFechaVencAnno');
    const inputTipoVacuna = document.getElementById('inputTipoVacuna');
    const inputNombreComercialVacuna = document.getElementById('inputNombreComercialVacuna');
    const resultados = document.getElementById('resultadosBusqueda');
    const paginacionContainer = document.getElementById('paginacionContainer');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Variables de estado para paginación
    let currentPage = 1;
    let totalPages = 1;

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
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>`;
        paginacionContainer.innerHTML = '';
    };

    // Función para validar que al menos un campo de búsqueda esté lleno
    const validarCamposBusqueda = () => {
        const currentNumLote = inputNumLote.value.trim();
        const currentLaboratorio = inputLaboratorio.value;
        const currentFechaCompraMes = inputFechaCompraMes.value;
        const currentFechaCompraAnno = inputFechaCompraAnno.value.trim();
        const currentFechaVencMes = inputFechaVencMes.value;
        const currentFechaVencAnno = inputFechaVencAnno.value.trim();
        const currentTipoVacuna = inputTipoVacuna.value.trim();
        const currentNombreComercialVacuna = inputNombreComercialVacuna.value.trim();

        if (!currentNumLote && !currentLaboratorio && !currentFechaCompraMes && !currentFechaCompraAnno && !currentFechaVencMes && !currentFechaVencAnno && !currentTipoVacuna && !currentNombreComercialVacuna) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan criterios de búsqueda',
                text: 'Por favor, ingrese al menos un criterio de búsqueda.',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        if ((currentFechaCompraMes && !currentFechaCompraAnno) || (!currentFechaCompraMes && currentFechaCompraAnno)) {
            Swal.fire({
                icon: 'warning',
                title: 'Falta el año/mes de compra',
                text: 'Por favor, ingrese tanto el mes como el año de compra.',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        if ((currentFechaVencMes && !currentFechaVencAnno) || (!currentFechaVencMes && currentFechaVencAnno)) {
            Swal.fire({
                icon: 'warning',
                title: 'Falta el año/mes de vencimiento',
                text: 'Por favor, ingrese tanto el mes como el año de vencimiento.',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        return true;
    };

    // Función principal de búsqueda (ahora con paginación)
    const buscarLotes = async (page = 1) => {
        currentPage = page;
        const currentNumLote = inputNumLote.value.trim();
        const currentLaboratorio = inputLaboratorio.value;
        const currentFechaCompraMes = inputFechaCompraMes.value;
        const currentFechaCompraAnno = inputFechaCompraAnno.value.trim();
        const currentFechaVencMes = inputFechaVencMes.value;
        const currentFechaVencAnno = inputFechaVencAnno.value.trim();
        const currentTipoVacuna = inputTipoVacuna.value.trim();
        const currentNombreComercialVacuna = inputNombreComercialVacuna.value.trim();

        if (!validarCamposBusqueda()) {
            return;
        }

        mostrarCarga();

        try {
            const params = new URLSearchParams();
            if (currentNumLote) params.append('numLote', currentNumLote);
            if (currentLaboratorio) params.append('id_laboratorio', currentLaboratorio);
            if (currentFechaCompraMes && currentFechaCompraAnno) {
                params.append('fecha_compra', `${currentFechaCompraAnno}-${currentFechaCompraMes.padStart(2, '0')}`);
            }
            if (currentFechaVencMes && currentFechaVencAnno) {
                params.append('fecha_venc', `${currentFechaVencAnno}-${currentFechaVencMes.padStart(2, '0')}`);
            }
            if (currentTipoVacuna) params.append('tipo_vacuna', currentTipoVacuna);
            if (currentNombreComercialVacuna) params.append('nombre_comercial_vacuna', currentNombreComercialVacuna);
            params.append('page', page);

            const response = await fetch(`/buscarlote?${params.toString()}`, {
                headers: { 'X-CSRF-Token': csrfToken }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error en la búsqueda');

            actualizarTabla(data.lotes);
            actualizarPaginacion(data.pagination);

        } catch (error) {
            console.error('Error:', error);
            resultados.innerHTML = '<tr><td colspan="8">Error en la búsqueda</td></tr>';
            paginacionContainer.innerHTML = '';
        }
    };

    // Función para actualizar tabla con resultados
    const actualizarTabla = (lotes) => {
        if (lotes.length === 0) {
            resultados.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-search me-2"></i>No se encontraron lotes
                    </td>
                </tr>`;
            return;
        }

        resultados.innerHTML = lotes.map(lote => {
        // Acceder a las vacunas asociadas al lote
        const vacuna = lote.vacunas && lote.vacunas.length > 0 ? lote.vacunas[0] : { tipo: 'No especificado', nombre_comercial: 'No especificado' };

        return `
            <tr>
                <td>${lote.num_lote}</td>
                <td>${lote.laboratorio.nombre}</td>
                <td>${vacuna.tipo}</td>
                <td>${vacuna.nombre_comercial}</td>
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
        `;
    }).join('');

    document.querySelectorAll('.borrar-lote').forEach(btn => {
        btn.addEventListener('click', async () => {
            await btnBorrarLote(btn.dataset.id, csrfToken);
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
        inputNumLote.value = '';
        inputLaboratorio.value = '';
        inputFechaCompraMes.value = '';
        inputFechaCompraAnno.value = '';
        inputFechaVencMes.value = '';
        inputFechaVencAnno.value = '';
        inputTipoVacuna.value = '';
        inputNombreComercialVacuna.value = '';
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
                buscarLotes(page);
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