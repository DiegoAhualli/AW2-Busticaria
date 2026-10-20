(function () {
    const contenedorCarrito = document.getElementById('contenedorCarrito');
    const btnRealizarCompra = document.getElementById('btnRealizarCompra');
    const btnVolverComprar = document.getElementById('btnVolverComprar');
    const inputDireccion = document.getElementById('txtDireccionEnvio');

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
    let compraEnProceso = false;

    function escaparTexto(texto) {
        return String(texto ?? '').replace(/[&<>"']/g, function (caracter) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter];
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

    function formatearPesos(numero) {
        return Number(numero).toLocaleString('es-AR');
    }

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function mostrarCarrito() {
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = '<p class="alert alert-warning">No hay productos en el carrito.</p>';
            btnRealizarCompra.disabled = true;
            return;
        }
        btnRealizarCompra.disabled = compraEnProceso;

        contenedorCarrito.innerHTML = carrito.map(function (producto, indice) {
            const cantidad = Number(producto.cantidad);
            const precio = obtenerPrecioNumerico(producto.precio);
            const subtotal = precio * cantidad;

            return `
                <article class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${escaparTexto(producto.imagen)}"
                             class="card-img-top product-card__img"
                             alt="${escaparTexto(producto.titulo)}"
                             onerror="this.onerror=null;this.src='/assets/img/logo.webp';">
                        <div class="card-body">
                            <h3 class="card-title h5">${escaparTexto(producto.titulo)}</h3>
                            <p class="fw-bold">$${formatearPesos(precio)}</p>
                            <p class="small">Subtotal: $${formatearPesos(subtotal)}</p>
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <button class="btn btn-outline-secondary btn-restar-carrito"
                                        data-indice="${indice}" type="button">-</button>
                                <span>${cantidad}</span>
                                <button class="btn btn-outline-secondary btn-sumar-carrito"
                                        data-indice="${indice}" type="button">+</button>
                            </div>
                            <button class="btn btn-danger btn-eliminar-producto"
                                    data-indice="${indice}" type="button">Eliminar</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        const totalEstimado = carrito.reduce(function (acumulado, producto) {
            return acumulado + obtenerPrecioNumerico(producto.precio) * Number(producto.cantidad);
        }, 0);
        const resumen = document.createElement('p');
        resumen.className = 'col-12 fw-bold text-end';
        resumen.textContent = `Total estimado: $${formatearPesos(totalEstimado)}`;
        contenedorCarrito.appendChild(resumen);
    }

    // Cambios de cantidad y eliminación de productos.
    contenedorCarrito.addEventListener('click', function (evento) {
        if (compraEnProceso) return;
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
            const registro = productosServidor.find(item => Number(item.id) === Number(producto.id));
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

    // Confirmar la orden de compra mediante Express.
    btnRealizarCompra.addEventListener('click', async function () {
        if (compraEnProceso) return;
        if (carrito.length === 0) {
            alert('No hay productos en el carrito');
            return;
        }

        let usuario;
        try {
            usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
        } catch (error) {
            usuario = null;
        }
        if (!usuario || !Number.isInteger(Number(usuario.id)) || Number(usuario.id) <= 0) {
            alert('Iniciá sesión para realizar la compra');
            window.location.href = '/pages/auth/login/login.html';
            return;
        }

        const direccion = inputDireccion.value.trim();
        if (direccion.length < 5 || direccion.length > 200) {
            alert('Ingresá una dirección de entrega válida (5 a 200 caracteres)');
            inputDireccion.focus();
            return;
        }

        // Los carritos antiguos de AW1 pueden no contener identificadores.
        const detalles = carrito.map(item => ({
            id_producto: Number(item.id),
            cantidad: Number(item.cantidad)
        }));
        if (detalles.some(item => !Number.isInteger(item.id_producto) || item.id_producto <= 0 ||
            !Number.isInteger(item.cantidad) || item.cantidad <= 0) ||
            new Set(detalles.map(item => item.id_producto)).size !== detalles.length) {
            alert('El carrito tiene productos antiguos o incorrectos. Eliminá esos productos y agregalos nuevamente.');
            return;
        }

        if (!confirm('¿Confirmás el registro de la orden de compra? El pago quedará pendiente.')) {
            return;
        }

        compraEnProceso = true;
        btnRealizarCompra.disabled = true;
        btnRealizarCompra.textContent = 'Registrando pedido...';

        try {
            const respuesta = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: Number(usuario.id),
                    direccion,
                    productos: detalles
                })
            });

            const datos = await respuesta.json();
            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo registrar la compra');
                return;
            }

            // Sólo vaciar el carrito después de recibir el 201 del servidor.
            localStorage.removeItem('carrito');
            carrito = [];
            mostrarCarrito();
            alert(`Orden #${datos.venta.id} registrada por $${formatearPesos(datos.venta.total)}. Pago pendiente.`);

        } catch (error) {
            console.error('Error al registrar la compra:', error);
            alert('No se pudo conectar con el servidor. El carrito se conserva.');
        } finally {
            compraEnProceso = false;
            btnRealizarCompra.textContent = 'Realizar compra';
            btnRealizarCompra.disabled = carrito.length === 0;
        }
    });

    btnVolverComprar.addEventListener('click', function () {
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
})();
