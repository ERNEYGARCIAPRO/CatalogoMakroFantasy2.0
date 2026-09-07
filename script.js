// Variable global para almacenar los productos cargados desde el JSON
let productos = [];

// ==========================================
// 1. CARGA DE DATOS DESDE PRODUCTOS.JSON
// ==========================================
async function cargarProductosJSON() {
    try {
        const respuesta = await fetch('productos.json');
        if (!respuesta.ok) throw new Error('Error al cargar el archivo productos.json');
        
        productos = await respuesta.json();
        
        // Renderizar productos e inicializar los filtros una vez cargada la lista
        renderizarProductos(productos);
        inicializarFiltros();
    } catch (error) {
        console.error('Error:', error);
        const contenedor = document.getElementById('catalogo-container');
        if (contenedor) {
            contenedor.innerHTML = `
                <div style="color: #ffffff; text-align: center; padding: 50px 20px; font-size: 1.1rem;">
                    No se pudieron cargar los productos. Asegúrate de estar ejecutando un servidor local.
                </div>
            `;
        }
    }
}
// ==========================================
// 2. FORMATO Y RENDERIZADO DE TARJETAS
// ==========================================

// Formatea el número a formato moneda Colombia ($120.000)
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(precio);
}

// Renderiza las tarjetas de productos sin botón de WhatsApp
function renderizarProductos(listaProductos) {
    const contenedor = document.getElementById('catalogo-container');
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiar contenedor

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `
            <div style="color: #ffffff; text-align: center; padding: 50px 20px; font-size: 1.1rem;">
                No se encontraron productos que coincidan.
            </div>
        `;
        return;
    }

    listaProductos.forEach(prod => {
        // Generar imágenes del carrusel horizontal
        const imgsHTML = prod.imagenes.map((imgUrl, idx) => `
            <img src="${imgUrl}" alt="${prod.titulo} - Foto ${idx + 1}" class="producto-img">
        `).join('');

        // Generar indicadores (.dots) solo si hay más de 1 foto
        let dotsHTML = '';
        if (prod.imagenes.length > 1) {
            const dotsSpans = prod.imagenes.map((_, idx) => `
                <span class="dot ${idx === 0 ? 'active' : ''}"></span>
            `).join('');
            dotsHTML = `<div class="slider-dots">${dotsSpans}</div>`;
        }

        // Crear elemento tarjeta
        const tarjeta = document.createElement('article');
        tarjeta.className = 'producto-card';
        tarjeta.setAttribute('data-categoria', prod.categoria);

        tarjeta.innerHTML = `
            <div class="galeria-slider">
                ${imgsHTML}
            </div>
            ${dotsHTML}
            <div class="producto-info">
                <h3 class="titulo-producto">${prod.titulo}</h3>
                <p class="descripcion">${prod.descripcion}</p>
                <div class="precio-row">
                    <span class="precio">${formatearPrecio(prod.precio)} <span class="moneda">COP</span><span class="venta">Detal</span></span>
                    <span class="precio">${formatearPrecio(prod.mayor)} <span class="moneda">COP</span><span class="venta">Mayor a ${prod.minimo} unid. o mas</span></span>
                </div>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    // Activar controladores de movimiento de fotos para los sliders recién creados
    inicializarSliders();
}

// ==========================================
// 3. CONTROL DE FOTOS (DOTS & SCROLL HORIZONTAL)
// ==========================================
function inicializarSliders() {
    const sliders = document.querySelectorAll('.galeria-slider');

    sliders.forEach(slider => {
        const dotsContainer = slider.parentElement.querySelector('.slider-dots');
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.dot');

        const actualizarDotActivo = () => {
            const anchoFoto = slider.offsetWidth || window.innerWidth;
            if (anchoFoto === 0) return;

            const index = Math.round(slider.scrollLeft / anchoFoto);

            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        slider.addEventListener('scroll', actualizarDotActivo, { passive: true });
        slider.addEventListener('touchend', () => setTimeout(actualizarDotActivo, 50));
    });
}

// ==========================================
// 4. FILTROS Y BUSCADOR
// ==========================================
function inicializarFiltros() {
    const inputBuscador = document.getElementById('buscador');
    const selectCategoria = document.getElementById('filtro-categoria');

    const filtrar = () => {
        const textoBusqueda = inputBuscador ? inputBuscador.value.toLowerCase().trim() : '';
        const categoriaSeleccionada = selectCategoria ? selectCategoria.value.toLowerCase() : 'todos';

        const productosFiltrados = productos.filter(prod => {
            const coincideTexto = prod.titulo.toLowerCase().includes(textoBusqueda) || 
                                 prod.descripcion.toLowerCase().includes(textoBusqueda);
            const coincideCat = categoriaSeleccionada === 'todos' || 
                                prod.categoria.toLowerCase() === categoriaSeleccionada;

            return coincideTexto && coincideCat;
        });

        renderizarProductos(productosFiltrados);
    };

    if (inputBuscador) inputBuscador.addEventListener('input', filtrar);
    if (selectCategoria) selectCategoria.addEventListener('change', filtrar);
}

// =========================================
// 5. LIGHTBOX GLOBAL (DELEGACIÓN DE EVENTOS)
// ==========================================
function inicializarLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    document.addEventListener('click', (e) => {
        // Al presionar sobre cualquier imagen de producto
        if (e.target.classList.contains('producto-img')) {
            e.stopPropagation();
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Al presionar para cerrar el lightbox abierto
        if (lightbox.classList.contains('active')) {
            if (e.target.classList.contains('lightbox-close') || e.target === lightbox || e.target === lightboxImg) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ==========================================
// INICIALIZACIÓN GENERAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarLightbox();
    cargarProductosJSON();
});