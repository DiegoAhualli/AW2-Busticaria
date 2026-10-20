
// Controlador de la página principal de Busticaria.
// Consultamos los productos desde Express y los mostramos separados por categoría.

// Contenedores HTML donde vamos a insertar las tarjetas.
const contenedorTecnologia = document.getElementById('productosTecnologiaHome');
const contenedorRopa = document.getElementById('productosRopaHome');
const contenedorHogar = document.getElementById('productosHogarHome');

// Recuperamos el carrito que tenemos guardado en localStorage.
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

        // El frontend y la API funcionan desde el mismo servidor Express.
        // Consultamos el listado de productos con una solicitud GET.
        const respuesta = await fetch('/api/productos');

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al consultar productos`);
        }

        // Convertimos el JSON recibido a un arreglo de JavaScript.
        const productos = await respuesta.json();

        if (!Array.isArray(productos)) {
            throw new Error('La API no devolvió una lista de productos');
        }

        // Comprobamos que existan los tres contenedores del Home.
        if (!contenedorTecnologia || !contenedorRopa || !contenedorHogar) {
            throw new Error('Faltan contenedores de productos en home.html');
        }

        // Solamente mostramos productos disponibles y con stock.
        const disponibles = productos.filter(function (producto) {
            return producto.disponible === true && producto.stock > 0;
        });

        // Esta función nos permite reutilizar la misma lógica
        // para mostrar las tres categorías.
        function mostrarProductos(categoria, contenedor) {

            // Filtramos los productos según la categoría solicitada.
            const lista = disponibles.filter(function (producto) {
                return producto.categoria === categoria;
            });

            if (lista.length === 0) {
                contenedor.innerHTML =
                    '<p class="text-muted">No hay productos disponibles.</p>';
                return;
            }

            // Utilizamos el componente crearCardProducto para evitar
            // repetir el HTML de las tarjetas en cada categoría.
            contenedor.innerHTML = lista.map(function (producto) {
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

        // Cargamos cada grupo en su contenedor correspondiente.
        mostrarProductos('tecnologia', contenedorTecnologia);
        mostrarProductos('ropa', contenedorRopa);
        mostrarProductos('hogar', contenedorHogar);

        // A partir del botón presionado buscamos el ID del producto.
        // Esto es importante porque puede haber productos con el mismo nombre.
        function obtenerProductoDeBoton(boton) {

            const articulo = boton.closest('article');

            if (!articulo) return null;

            const id = Number(articulo.dataset.id);

            return disponibles.find(function (producto) {
                return Number(producto.id) === id;
            }) || null;
        }

        // BOTÓN +
        // Aumentamos la cantidad seleccionada sin superar el stock del producto.
        document.querySelectorAll('.btn-sumar').forEach(function (boton) {

            boton.addEventListener('click', function () {

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

        // BOTÓN -
        // Restamos una unidad evitando cantidades negativas.
        document.querySelectorAll('.btn-restar').forEach(function (boton) {

            boton.addEventListener('click', function () {

                const cantidad = boton.parentElement.querySelector('.cantidad');
                const valor = Number(cantidad.textContent);

                if (valor > 0) {
                    cantidad.textContent = valor - 1;
                }
            });
        });

        // BOTÓN AGREGAR AL CARRITO
        document.querySelectorAll('.btn-agregar-carrito').forEach(function (boton) {

            boton.addEventListener('click', function () {

                // Primero comprobamos si el usuario inició sesión.
                const usuarioLogueado = sessionStorage.getItem('usuarioLogueado');

                if (!usuarioLogueado) {
                    alert('Debes iniciar sesión para agregar productos al carrito');
                    window.location.href = '/pages/auth/login/login.html';
                    return;
                }

                // Identificamos el producto correspondiente al botón presionado.
                const producto = obtenerProductoDeBoton(boton);

                if (!producto) {
                    alert('No se encontró el producto');
                    return;
                }

                const articulo = boton.closest('article');
                const cantidadElemento = articulo.querySelector('.cantidad');
                const cantidad = Number(cantidadElemento.textContent);

                // No permitimos agregar cantidades inválidas.
                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    alert('Seleccione una cantidad');
                    return;
                }

                // Recuperamos el carrito y comprobamos si ya contiene el producto.
                const carrito = leerCarrito();

                const existente = carrito.find(function (item) {
                    return Number(item.id) === Number(producto.id);
                });

                const cantidadEnCarrito = existente
                    ? Number(existente.cantidad)
                    : 0;

                // Sumamos las unidades existentes con las nuevas
                // para no superar la cantidad disponible.
                if (cantidadEnCarrito + cantidad > producto.stock) {
                    alert('La cantidad supera el stock disponible');
                    return;
                }

                // Si ya existe actualizamos su cantidad.
                // Si no existe agregamos un nuevo objeto al carrito.
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

                // Guardamos el carrito actualizado para recuperarlo
                // cuando el usuario ingrese a otra página.
                localStorage.setItem('carrito', JSON.stringify(carrito));

                // Reiniciamos el selector después de agregar el producto.
                cantidadElemento.textContent = '0';

                alert('Producto agregado al carrito');
            });
        });

    } catch (error) {

        // Si ocurre un error al consultar o mostrar productos,
        // lo registramos en consola y avisamos al usuario.
        console.error('Error al cargar los productos:', error);

        alert('No se pudieron cargar los productos. Revisá que Express esté encendido.');
    }
}

// Iniciamos la carga cuando se abre el Home.
cargarProductosHome();
