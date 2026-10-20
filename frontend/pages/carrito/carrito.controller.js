const contenedorCarrito = document.getElementById('contenedorCarrito');
const btnRealizarCompra = document.getElementById('btnRealizarCompra');
const btnVolverComprar = document.getElementById('btnVolverComprar');

function obtenerCarritoGuardado() {
    try {
        const valor = JSON.parse(localStorage.getItem('carrito'));
        return Array.isArray(valor) ? valor : [];
    } catch (error) {
        return [];
    }
}

let carrito = obtenerCarritoGuardado();
let productosServidor = [];

function escaparTexto(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, function(caracter) {
        return {
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        }[caracter];
    });
}

function obtenerPrecioNumerico(precio) {
    if (typeof precio === 'number') return Number.isFinite(precio) ? precio : 0;
    if (typeof precio !== 'string') return 0;

    let valor = precio.trim().replace(/[^0-9.,-]/g, '');
    if (valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (/^\d{1,3}(\.\d{3})+$/.test(valor)) {
        valor = valor.replace(/\./g, '');
    }
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarCarrito() {
    contenedorCarrito.innerHTML = '';

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = '<p class="alert alert-warning">No hay productos en el carrito.</p>';
        return;
    }

    contenedorCarrito.innerHTML = carrito.map(function(producto, indice) {
        const cantidad = Number(producto.cantidad);
        const precio = obtenerPrecioNumerico(producto.precio);
        const precioFormateado = precio.toLocaleString('es-AR');
        const subtotalFormateado = (precio * cantidad).toLocaleString('es-AR');
        const imagen = escaparTexto(producto.imagen);

        return `
            <article class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${imagen}" class="card-img-top product-card__img"
                         alt="${escaparTexto(producto.titulo)}"
                         onerror="this.onerror=null;this.src='/assets/img/logo.webp';">
                    <div class="card-body">
                        <h3 class="card-title h5">${escaparTexto(producto.titulo)}</h3>
                        <p class="fw-bold">$${precioFormateado}</p>
                        <p class="small">Subtotal: $${subtotalFormateado}</p>
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <button class="btn btn-outline-secondary btn-restar-carrito" data-indice="${indice}" type="button">-</button>
                            <span>${cantidad}</span>
                            <button class="btn btn-outline-secondary btn-sumar-carrito" data-indice="${indice}" type="button">+</button>
                        </div>
                        <button class="btn btn-danger btn-eliminar-producto" data-indice="${indice}" type="button">Eliminar</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    const total = carrito.reduce(function(acumulado, producto) {
        return acumulado + obtenerPrecioNumerico(producto.precio) * Number(producto.cantidad);
    }, 0);

    const resumen = document.createElement('p');
    resumen.className = 'col-12 fw-bold text-end';
    resumen.textContent = `Total: $${total.toLocaleString('es-AR')}`;
    contenedorCarrito.appendChild(resumen);
}

// Un solo evento para los controles del carrito.
contenedorCarrito.addEventListener('click', function(evento) {
    const boton = evento.target.closest('button[data-indice]');
    if (!boton || !contenedorCarrito.contains(boton)) return;

    const indice = Number(boton.dataset.indice);
    const producto = carrito[indice];
    if (!producto) return;

    if (boton.classList.contains('btn-eliminar-producto')) {
        carrito.splice(indice, 1);
    } else if (boton.classList.contains('btn-restar-carrito')) {
        if (Number(producto.cantidad) > 1) {
            producto.cantidad = Number(producto.cantidad) - 1;
        } else {
            carrito.splice(indice, 1);
        }
    } else if (boton.classList.contains('btn-sumar-carrito')) {
        const registro = productosServidor.find(function(item) {
            return Number(item.id) === Number(producto.id);
        });

        if (!registro || !registro.disponible || registro.stock <= Number(producto.cantidad)) {
            alert('No hay más stock disponible o no se pudo verificar el producto');
            return;
        }
        producto.cantidad = Number(producto.cantidad) + 1;
    } else {
        return;
    }

    guardarCarrito();
    mostrarCarrito();
});

btnRealizarCompra.addEventListener('click', function() {
    if (carrito.length === 0) {
        alert('No hay productos en el carrito.');
        return;
    }

    // Todavía no se registra una venta: se implementa en el paso siguiente.
    alert('El carrito está preparado. Falta conectar la confirmación de compra con el servidor.');
});

btnVolverComprar.addEventListener('click', function() {
    window.location.href = '/pages/home.html';
});

async function iniciarCarrito() {
    try {
        const respuesta = await fetch('/api/productos');
        if (!respuesta.ok) throw new Error('No se pudo consultar el stock');
        const datos = await respuesta.json();
        if (!Array.isArray(datos)) throw new Error('Respuesta de productos incorrecta');
        productosServidor = datos;
    } catch (error) {
        console.error('No se pudo verificar el stock:', error);
    }
    mostrarCarrito();
}

iniciarCarrito();
