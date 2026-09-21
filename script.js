// Variable global para almacenar los productos cargados desde el JSON
let productos = [];

// Cargar carrito desde localStorage o iniciar vacío
let carrito = JSON.parse(localStorage.getItem('carrito_makro')) || [];

// ==========================================
// 1. CARGA DE DATOS DESDE PRODUCTOS.JSON
// ==========================================
async function cargarProductosJSON() {
    try {
        const respuesta = await fetch('productos.json');
        if (!respuesta.ok) throw new Error('Error al cargar el archivo productos.json');
        
        productos = await respuesta.json();
        
        // Renderizar catálogo e inicializar interfaz del carrito
        renderizarProductos(productos);
        inicializarFiltros();
        actualizarCarritoUI();
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
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(precio);
}

function renderizarProductos(listaProductos) {
    const contenedor = document.getElementById('catalogo-container');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `
            <div style="color: #ffffff; text-align: center; padding: 50px 20px; font-size: 1.1rem;">
                No se encontraron productos que coincidan.
            </div>
        `;
        return;
    }

    listaProductos.forEach(prod => {
        const imgsHTML = prod.imagenes.map((imgUrl, idx) => `
            <img src="${imgUrl}" alt="${prod.titulo} - Foto ${idx + 1}" class="producto-img">
        `).join('');

        let dotsHTML = '';
        if (prod.imagenes.length > 1) {
            const dotsSpans = prod.imagenes.map((_, idx) => `
                <span class="dot ${idx === 0 ? 'active' : ''}"></span>
            `).join('');
            dotsHTML = `<div class="slider-dots">${dotsSpans}</div>`;
        }

        const tarjeta = document.createElement('article');
        tarjeta.className = 'producto-card';
        tarjeta.setAttribute('data-categoria', prod.categoria);

        // Estructura adaptada con grid
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
                    <span class="precio">${formatearPrecio(prod.mayor)} <span class="moneda">COP</span><span class="venta">Mayor a ${prod.minimo} unid o mas.</span></span>
                    <button class="btn-agregar-carrito" data-id="${prod.id}" title="Agregar al carrito"> Agregar +</button>
                </div>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    inicializarSliders();
}

// ==========================================
// 3. LÓGICA DEL CARRITO (localStorage)
// ==========================================
function guardarCarrito() {
    localStorage.setItem('carrito_makro', JSON.stringify(carrito));
    actualizarCarritoUI();
}

function agregarAlCarrito(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const itemExistente = carrito.find(item => item.id === idProducto);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            titulo: producto.titulo,
            precio: producto.precio,
            mayor: producto.mayor,
            minimo: producto.minimo || 6,
            cantidad: 1
        });
    }

    guardarCarrito();
    abrirCarrito();
}

function cambiarCantidad(idProducto, cambio) {
    const item = carrito.find(p => p.id === idProducto);
    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        eliminarDelCarrito(idProducto);
    } else {
        guardarCarrito();
    }
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarrito();
}

function actualizarCarritoUI() {
    const contenedorItems = document.getElementById('carrito-items');
    const contador = document.getElementById('carrito-contador');
    const totalPrecioElem = document.getElementById('carrito-total-precio');

    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (contador) contador.textContent = totalProductos;

    if (!contenedorItems) return;

    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">Tu carrito está vacío.</p>';
        if (totalPrecioElem) totalPrecioElem.textContent = '$0 COP';
        return;
    }

    let html = '';
    let granTotal = 0;

    carrito.forEach(item => {
        const aplicaMayor = item.cantidad >= item.minimo;
        const precioUnitario = aplicaMayor ? item.mayor : item.precio;
        const subtotal = precioUnitario * item.cantidad;
        granTotal += subtotal;

        html += `
            <div class="item-carrito">
                <div class="item-detalles">
                    <h4>${item.titulo}</h4>
                    <p>${formatearPrecio(precioUnitario)} c/u</p>
                    ${aplicaMayor ? `<span class="badge-mayor">¡Precio x Mayor Aplicado!</span>` : ''}
                </div>
                <div class="item-controles">
                    <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">&times;</button>
                </div>
            </div>
        `;
    });

    contenedorItems.innerHTML = html;
    if (totalPrecioElem) totalPrecioElem.textContent = formatearPrecio(granTotal);
}

// ==========================================
// 4. CONTROL DEL PANEL LATERAL
// ==========================================
function abrirCarrito() {
    document.getElementById('panel-carrito')?.classList.add('active');
    document.getElementById('carrito-overlay')?.classList.add('active');
}

function cerrarCarrito() {
    document.getElementById('panel-carrito')?.classList.remove('active');
    document.getElementById('carrito-overlay')?.classList.remove('active');
}

// ==========================================
// 5. ENVÍO DE PEDIDO A WHATSAPP
// ==========================================
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    const TELEFONO_WHATSAPP = '573000000000'; // Reemplazar por tu número oficial
    let mensaje = '¡Hola MakroFantasy! Deseo realizar el siguiente pedido desde el catálogo virtual:\n\n';
    let granTotal = 0;

    carrito.forEach((item, index) => {
        const aplicaMayor = item.cantidad >= item.minimo;
        const precioUnitario = aplicaMayor ? item.mayor : item.precio;
        const subtotal = precioUnitario * item.cantidad;
        granTotal += subtotal;

        mensaje += `${index + 1}. *${item.titulo}*\n`;
        mensaje += `   • Cantidad: ${item.cantidad}\n`;
        mensaje += `   • Precio: ${formatearPrecio(precioUnitario)} ${aplicaMayor ? '(Por mayor)' : '(Detal)'}\n`;
        mensaje += `   • Subtotal: ${formatearPrecio(subtotal)}\n\n`;
    });

    mensaje += `*Total Estimado:* ${formatearPrecio(granTotal)}\n\n`;
    mensaje += 'Quedo a la espera para confirmar disponibilidad y datos de envío.';

    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ==========================================
// 6. OTROS MÓDULOS (SLIDERS, FILTROS, LIGHTBOX)
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
                if (i === index) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };

        slider.addEventListener('scroll', actualizarDotActivo, { passive: true });
        slider.addEventListener('touchend', () => setTimeout(actualizarDotActivo, 50));
    });
}

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

function inicializarLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('producto-img')) {
            e.stopPropagation();
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        if (lightbox.classList.contains('active')) {
            if (e.target.classList.contains('lightbox-close') || e.target === lightbox || e.target === lightboxImg) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ==========================================
// INICIALIZACIÓN GLOBAL DE EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarLightbox();
    cargarProductosJSON();

    // Eventos del Panel de Carrito
    document.getElementById('btn-carrito')?.addEventListener('click', abrirCarrito);
    document.getElementById('cerrar-carrito')?.addEventListener('click', cerrarCarrito);
    document.getElementById('carrito-overlay')?.addEventListener('click', cerrarCarrito);
    document.getElementById('btn-enviar-whatsapp')?.addEventListener('click', enviarPedidoWhatsApp);

    // Delegación global para botones "+ Carrito" en tarjetas dinámicas
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) {
            const id = Number(e.target.getAttribute('data-id'));
            if (id) agregarAlCarrito(id);
        }
    });
});