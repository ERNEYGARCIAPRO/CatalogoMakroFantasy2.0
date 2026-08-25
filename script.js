document.addEventListener('DOMContentLoaded', () => {
    // 1. GESTIÓN DE PUNTOS INDICADORES (.DOTS) EN EL SLIDER DE FOTOS
const inicializarSliders = () => {
        const sliders = document.querySelectorAll('.galeria-slider');

        sliders.forEach(slider => {
            const dotsContainer = slider.parentElement.querySelector('.slider-dots');
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');

            const actualizarDotActivo = () => {
                const anchoFoto = slider.offsetWidth || window.innerWidth;
                if (anchoFoto === 0) return;

                // Calcula el índice de la foto actual dividiendo el scroll entre el ancho visible
                const index = Math.round(slider.scrollLeft / anchoFoto);

                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            };

            // Escuchar múltiples eventos para asegurar detección en celular y escritorio
            slider.addEventListener('scroll', actualizarDotActivo, { passive: true });
            slider.addEventListener('touchend', () => setTimeout(actualizarDotActivo, 50));
        });
    };

    // 2. BUSCADOR Y FILTRO POR CATEGORÍA
    const inputBuscador = document.getElementById('buscador');
    const selectCategoria = document.getElementById('filtro-categoria');
    const tarjetasProductos = document.querySelectorAll('.producto-card');

    const filtrarProductos = () => {
        const textoBusqueda = inputBuscador ? inputBuscador.value.toLowerCase().trim() : '';
        const categoriaSeleccionada = selectCategoria ? selectCategoria.value.toLowerCase() : 'todos';

        tarjetasProductos.forEach(card => {
            const titulo = card.querySelector('.titulo-producto')?.textContent.toLowerCase() || '';
            const descripcion = card.querySelector('.descripcion')?.textContent.toLowerCase() || '';
            const categoriaCard = card.getAttribute('data-categoria')?.toLowerCase() || '';

            const coincideTexto = titulo.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
            const coincideCategoria = categoriaSeleccionada === 'todos' || categoriaCard === categoriaSeleccionada;

            card.style.display = (coincideTexto && coincideCategoria) ? '' : 'none';
        });
    };

    if (inputBuscador) inputBuscador.addEventListener('input', filtrarProductos);
    if (selectCategoria) selectCategoria.addEventListener('change', filtrarProductos);

    // Inicializar listeners
    inicializarSliders();
});