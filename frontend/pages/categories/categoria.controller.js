const contenedorProductos = document.getElementById('contenedorProductos');

const categorias = {
    'categoria-tecnologia.html': 'tecnologia',
    'categoria-ropa.html': 'ropa',
    'categoria-hogar.html': 'hogar'
};

const paginaActual = window.location.pathname.split('/').pop();
const categoriaActual = categorias[paginaActual];

function leerCarritoCategoria() {
    try {
        const guardado = JSON.parse(localStorage.getItem('carrito'));
        return Array.isArray(guardado) ? guardado : [];
    } catch (error) {
        return [];
    }
}

async function cargarProductosCategoria() {
    if (!contenedorProductos || !categoriaActual) {
        console.error('No se encontró el contenedor o la categoría actual.');
        return;
    }

    try {
        const respuesta = await fetch('/api/productos');
        if (!respuesta.ok) {
            throw new Error(`No se pudieron consultar productos (${respuesta.status})`);
        }

        const productos = await respuesta.json();
        if (!Array.isArray(productos)) {
            throw new Error('El servidor no devolvió una lista de productos.');
        }

        const productosFiltrados = productos.filter(function(producto) {
            return producto.categoria === categoriaActual &&
                producto.disponible === true && producto.stock > 0;
        });

        if (productosFiltrados.length === 0) {
            contenedorProductos.innerHTML = '<p class="text-muted">No hay productos disponibles en esta categoría.</p>';
            return;
        }

        contenedorProductos.innerHTML = productosFiltrados.map(function(producto) {
            return crearCardProducto({
                id: producto.id,
                titulo: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                stock: producto.stock,
                imagen: '/assets/img/' + producto.imagen
            });
        }).join('');

        // Un único listener maneja los botones de todas las tarjetas.
        contenedorProductos.addEventListener('click', function(evento) {
            const boton = evento.target.closest('button');
            if (!boton || !contenedorProductos.contains(boton)) return;

            const articulo = boton.closest('article');
            if (!articulo) return;

            const idProducto = Number(articulo.dataset.id);
            const producto = productosFiltrados.find(function(item) {
                return Number(item.id) === idProducto;
            });
            if (!producto) return;

            const indicadorCantidad = articulo.querySelector('.cantidad');
            const cantidad = Number(indicadorCantidad.textContent);

            if (boton.classList.contains('btn-sumar')) {
                if (cantidad >= producto.stock) {
                    alert('No hay más stock disponible');
                    return;
                }
                indicadorCantidad.textContent = cantidad + 1;
                return;
            }

            if (boton.classList.contains('btn-restar')) {
                if (cantidad > 0) indicadorCantidad.textContent = cantidad - 1;
                return;
            }

            if (!boton.classList.contains('btn-agregar-carrito')) return;

            if (!sessionStorage.getItem('usuarioLogueado')) {
                alert('Debes iniciar sesión para agregar productos al carrito');
                window.location.href = '/pages/auth/login/login.html';
                return;
            }

            if (!Number.isInteger(cantidad) || cantidad < 1) {
                alert('Seleccione una cantidad');
                return;
            }

            const carrito = leerCarritoCategoria();
            const existente = carrito.find(function(item) {
                return Number(item.id) === idProducto;
            });
            const cantidadAcumulada = existente ? Number(existente.cantidad) : 0;

            if (cantidadAcumulada + cantidad > producto.stock) {
                alert('La cantidad supera el stock disponible');
                return;
            }

            if (existente) {
                existente.cantidad = cantidadAcumulada + cantidad;
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
            indicadorCantidad.textContent = '0';
            alert('Producto agregado al carrito');
        });
    } catch (error) {
        console.error('Error al cargar la categoría:', error);
        contenedorProductos.innerHTML = '<p class="alert alert-danger">No se pudieron cargar los productos.</p>';
    }
}

cargarProductosCategoria();
