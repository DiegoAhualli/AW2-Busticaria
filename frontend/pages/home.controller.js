
const contenedorTecnologia = document.getElementById('productosTecnologiaHome');
const contenedorRopa = document.getElementById('productosRopaHome');
const contenedorHogar = document.getElementById('productosHogarHome');

function leerCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito'));
        return Array.isArray(carrito) ? carrito : [];
    } catch (error) {
        return [];
    }
}

async function cargarProductosHome() {
    try {
        // El frontend y la API se ejecutan en el mismo servidor Express.
        const respuesta = await fetch('/api/productos');

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al consultar productos`);
        }

        const productos = await respuesta.json();
        if (!Array.isArray(productos)) {
            throw new Error('La API no devolvió una lista de productos');
        }
        if (!contenedorTecnologia || !contenedorRopa || !contenedorHogar) {
            throw new Error('Faltan contenedores de productos en home.html');
        }

        // Sólo mostrar productos a la venta (disponibles y con stock).
        const disponibles = productos.filter(function(producto) {
            return producto.disponible === true && producto.stock > 0;
        });

        function mostrarProductos(categoria, contenedor) {
            const lista = disponibles.filter(function(producto) {
                return producto.categoria === categoria;
            });

            if (lista.length === 0) {
                contenedor.innerHTML = '<p class="text-muted">No hay productos disponibles.</p>';
                return;
            }

            contenedor.innerHTML = lista.map(function(producto) {
                return crearCardProducto({
                    id: producto.id,
                    titulo: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    stock: producto.stock,
                    imagen: '/assets/img/' + producto.imagen
                });
            }).join('');
        }

        mostrarProductos('tecnologia', contenedorTecnologia);
        mostrarProductos('ropa', contenedorRopa);
        mostrarProductos('hogar', contenedorHogar);

        // Función auxiliar para obtener el producto real a partir del ID.
        function obtenerProductoDeBoton(boton) {
            const articulo = boton.closest('article');
            if (!articulo) return null;
            const id = Number(articulo.dataset.id);
            return disponibles.find(function(producto) {
                return Number(producto.id) === id;
            }) || null;
        }

        // Botón +
        document.querySelectorAll('.btn-sumar').forEach(function(boton) {
            boton.addEventListener('click', function() {
                const producto = obtenerProductoDeBoton(boton);
                if (!producto) return;

                const cantidad = boton.parentElement.querySelector('.cantidad');
                const valor = Number(cantidad.textContent);

                if (valor >= producto.stock) {
                    alert('No hay más stock disponible');
                    return;
                }

                cantidad.textContent = valor + 1;
            });
        });

        // Botón -
        document.querySelectorAll('.btn-restar').forEach(function(boton) {
            boton.addEventListener('click', function() {
                const cantidad = boton.parentElement.querySelector('.cantidad');
                const valor = Number(cantidad.textContent);
                if (valor > 0) cantidad.textContent = valor - 1;
            });
        });

        // Agregar productos al carrito
        document.querySelectorAll('.btn-agregar-carrito').forEach(function(boton) {
            boton.addEventListener('click', function() {
                const usuarioLogueado = sessionStorage.getItem('usuarioLogueado');
                if (!usuarioLogueado) {
                    alert('Debes iniciar sesión para agregar productos al carrito');
                    window.location.href = '/pages/auth/login/login.html';
                    return;
                }

                const producto = obtenerProductoDeBoton(boton);
                if (!producto) {
                    alert('No se encontró el producto');
                    return;
                }

                const articulo = boton.closest('article');
                const cantidadElemento = articulo.querySelector('.cantidad');
                const cantidad = Number(cantidadElemento.textContent);
                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    alert('Seleccione una cantidad');
                    return;
                }

                const carrito = leerCarrito();
                const existente = carrito.find(function(item) {
                    return Number(item.id) === Number(producto.id);
                });
                const cantidadEnCarrito = existente ? Number(existente.cantidad) : 0;

                if (cantidadEnCarrito + cantidad > producto.stock) {
                    alert('La cantidad supera el stock disponible');
                    return;
                }

                if (existente) {
                    existente.cantidad = cantidadEnCarrito + cantidad;
                } else {
                    carrito.push({
                        id: producto.id,
                        titulo: producto.nombre,
                        precio: producto.precio,
                        cantidad: cantidad,
                        imagen: articulo.querySelector('img').src
                    });
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                cantidadElemento.textContent = '0';
                alert('Producto agregado al carrito');
            });
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        alert('No se pudieron cargar los productos. Revisá que Express esté encendido.');
    }
}

cargarProductosHome();
