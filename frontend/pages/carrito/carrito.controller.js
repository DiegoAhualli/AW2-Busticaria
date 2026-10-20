
(function () {

    // Elementos HTML utilizados para mostrar el carrito y realizar la compra.
    const contenedorCarrito = document.getElementById('contenedorCarrito');
    const btnRealizarCompra = document.getElementById('btnRealizarCompra');
    const btnVolverComprar = document.getElementById('btnVolverComprar');
    const inputDireccion = document.getElementById('txtDireccionEnvio');

    // Recuperamos los productos que el usuario fue agregando.
    function obtenerCarritoGuardado() {
        try {
            const valor = JSON.parse(localStorage.getItem('carrito'));
            return Array.isArray(valor) ? valor : [];
        } catch (error) {
            return [];
        }
    }

    let carrito = obtenerCarritoGuardado();

    // Acá guardamos el catálogo del servidor para consultar el stock.
    let productosServidor = [];

    // Esta variable evita que el usuario registre dos veces la misma compra
    // presionando repetidamente el botón.
    let compraEnProceso = false;

    // Evitamos insertar caracteres especiales directamente dentro del HTML.
    function escaparTexto(texto) {
        return String(texto ?? '').replace(/[&<>"']/g, function (caracter) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[caracter];
        });
    }

    // Convertimos el precio en un número.
    // También contemplamos el formato anterior del carrito de AW1,
    // donde algunos precios podían estar guardados como texto.
    function obtenerPrecioNumerico(precio) {
        if (typeof precio === 'number') {
            return Number.isFinite(precio) ? precio : 0;
        }

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

    // Formateamos los importes para mostrarlos en pesos argentinos.
    function formatearPesos(numero) {
        return Number(numero).toLocaleString('es-AR');
    }

    // Guardamos los cambios del carrito en el navegador.
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Generamos el HTML de los productos agregados al carrito.
    function mostrarCarrito() {

        // Si está vacío mostramos un mensaje y deshabilitamos la compra.
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML =
                '<p class="alert alert-warning">No hay productos en el carrito.</p>';

            btnRealizarCompra.disabled = true;
            return;
        }

        btnRealizarCompra.disabled = compraEnProceso;

        // Recorremos el carrito y creamos una tarjeta por cada producto.
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

                            <!-- Botones para modificar la cantidad del producto -->
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <button class="btn btn-outline-secondary btn-restar-carrito"
                                        data-indice="${indice}" type="button">-</button>

                                <span>${cantidad}</span>

                                <button class="btn btn-outline-secondary btn-sumar-carrito"
                                        data-indice="${indice}" type="button">+</button>
                            </div>

                            <button class="btn btn-danger btn-eliminar-producto"
                                    data-indice="${indice}" type="button">
                                Eliminar
                            </button>

                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Sumamos los subtotales para mostrar un total estimado.
        // El total definitivo lo calcula Express al registrar la venta,
        // utilizando los precios de productos.json.
        const totalEstimado = carrito.reduce(function (acumulado, producto) {
            return acumulado +
                obtenerPrecioNumerico(producto.precio) * Number(producto.cantidad);
        }, 0);

        const resumen = document.createElement('p');
        resumen.className = 'col-12 fw-bold text-end';
        resumen.textContent = `Total estimado: $${formatearPesos(totalEstimado)}`;

        contenedorCarrito.appendChild(resumen);
    }

    // Manejamos los botones para sumar, restar o eliminar productos.
    contenedorCarrito.addEventListener('click', function (evento) {

        // No permitimos modificar el carrito mientras se registra una compra.
        if (compraEnProceso) return;

        const boton = evento.target.closest('button[data-indice]');

        if (!boton || !contenedorCarrito.contains(boton)) return;

        const indice = Number(boton.dataset.indice);
        const producto = carrito[indice];

        if (!producto) return;

        // Eliminar directamente el producto del carrito.
        if (boton.classList.contains('btn-eliminar-producto')) {
            carrito.splice(indice, 1);

        // Restar una unidad o eliminar el producto si solamente quedaba una.
        } else if (boton.classList.contains('btn-restar-carrito')) {

            if (Number(producto.cantidad) > 1) {
                producto.cantidad = Number(producto.cantidad) - 1;
            } else {
                carrito.splice(indice, 1);
            }

        // Sumar una unidad verificando antes el stock del servidor.
        } else if (boton.classList.contains('btn-sumar-carrito')) {

            const registro = productosServidor.find(function (item) {
                return Number(item.id) === Number(producto.id);
            });

            if (!registro ||
                !registro.disponible ||
                registro.stock <= Number(producto.cantidad)) {

                alert('No hay más stock disponible o no se pudo verificar el producto');
                return;
            }

            producto.cantidad = Number(producto.cantidad) + 1;

        } else {
            return;
        }

        // Guardamos los cambios y volvemos a mostrar el carrito actualizado.
        guardarCarrito();
        mostrarCarrito();
    });

    // BOTÓN REALIZAR COMPRA
    // Este evento conecta el carrito con la ruta POST /api/ventas.
    btnRealizarCompra.addEventListener('click', async function () {

        if (compraEnProceso) return;

        if (carrito.length === 0) {
            alert('No hay productos en el carrito');
            return;
        }

        // Recuperamos los datos del usuario que inició sesión.
        let usuario;

        try {
            usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
        } catch (error) {
            usuario = null;
        }

        // Necesitamos un ID válido para asociar la venta con usuarios.json.
        if (!usuario ||
            !Number.isInteger(Number(usuario.id)) ||
            Number(usuario.id) <= 0) {

            alert('Iniciá sesión para realizar la compra');
            window.location.href = '/pages/auth/login/login.html';
            return;
        }

        // Validamos la dirección de entrega.
        const direccion = inputDireccion.value.trim();

        if (direccion.length < 5 || direccion.length > 200) {
            alert('Ingresá una dirección de entrega válida (5 a 200 caracteres)');
            inputDireccion.focus();
            return;
        }

        // Preparamos los productos con la estructura utilizada en ventas.json.
        // Enviamos solamente el ID y la cantidad, no los precios del carrito.
        const detalles = carrito.map(function (item) {
            return {
                id_producto: Number(item.id),
                cantidad: Number(item.cantidad)
            };
        });

        // Validamos que todos los productos tengan identificadores y cantidades
        // correctas antes de enviarlos al backend.
        if (
            detalles.some(function (item) {
                return !Number.isInteger(item.id_producto) ||
                    item.id_producto <= 0 ||
                    !Number.isInteger(item.cantidad) ||
                    item.cantidad <= 0;
            }) ||
            new Set(detalles.map(item => item.id_producto)).size !== detalles.length
        ) {
            alert('El carrito tiene productos antiguos o incorrectos. Eliminá esos productos y agregalos nuevamente.');
            return;
        }

        // Pedimos confirmación antes de registrar la orden.
        // El pago queda pendiente porque no incorporamos una pasarela de pago.
        if (!confirm('¿Confirmás el registro de la orden de compra? El pago quedará pendiente.')) {
            return;
        }

        compraEnProceso = true;
        btnRealizarCompra.disabled = true;
        btnRealizarCompra.textContent = 'Registrando pedido...';

        try {

            // Enviamos la orden a Express utilizando POST y un cuerpo JSON.
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

            // Si Express rechaza la operación, mantenemos el carrito.
            if (!respuesta.ok) {
                alert(datos.mensaje || 'No se pudo registrar la compra');
                return;
            }

            // Solamente vaciamos el carrito si el servidor confirmó la compra.
            // La venta ya queda registrada en ventas.json y se actualiza el stock.
            localStorage.removeItem('carrito');
            carrito = [];

            mostrarCarrito();

            alert(
                `Orden #${datos.venta.id} registrada por ` +
                `$${formatearPesos(datos.venta.total)}. Pago pendiente.`
            );

        } catch (error) {

            // Si no podemos conectarnos con el backend, conservamos el carrito.
            console.error('Error al registrar la compra:', error);
            alert('No se pudo conectar con el servidor. El carrito se conserva.');

        } finally {

            // Restauramos el botón cuando finaliza el intento de compra.
            compraEnProceso = false;
            btnRealizarCompra.textContent = 'Realizar compra';
            btnRealizarCompra.disabled = carrito.length === 0;
        }
    });

    // Regresamos al catálogo principal para seguir seleccionando productos.
    btnVolverComprar.addEventListener('click', function () {
        window.location.href = '/pages/home.html';
    });

    // Consultamos el catálogo al abrir el carrito.
    // Lo utilizamos para validar los aumentos de cantidad.
    async function iniciarCarrito() {
        try {
            const respuesta = await fetch('/api/productos');

            if (!respuesta.ok) {
                throw new Error('No se pudo consultar el stock');
            }

            const datos = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error('Respuesta de productos incorrecta');
            }

            productosServidor = datos;

        } catch (error) {
            console.error('No se pudo verificar el stock:', error);
        }

        mostrarCarrito();
    }

    iniciarCarrito();

})();
