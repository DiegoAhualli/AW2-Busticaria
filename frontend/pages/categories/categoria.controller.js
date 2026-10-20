
(function () {

    // Este controlador lo usamos en las tres páginas de categorías.
    // Según la página que se abra, mostramos los productos correspondientes.

    const contenedorProductos = document.getElementById('contenedorProductos');

    // Relacionamos cada archivo HTML con la categoría guardada en productos.json.
    const categorias = {
        'categoria-tecnologia.html': 'tecnologia',
        'categoria-ropa.html': 'ropa',
        'categoria-hogar.html': 'hogar'
    };

    // Obtenemos el nombre del archivo HTML que está abierto.
    const nombrePagina = window.location.pathname.split('/').pop();
    const categoriaActual = categorias[nombrePagina];

    // Recuperamos el carrito desde localStorage.
    // Si todavía no hay productos o los datos no son válidos, devolvemos un arreglo vacío.
    function leerCarritoCategoria() {
        try {
            const guardado = JSON.parse(localStorage.getItem('carrito'));
            return Array.isArray(guardado) ? guardado : [];
        } catch (error) {
            return [];
        }
    }

    async function cargarProductosCategoria() {

        // Comprobamos que exista el contenedor y que la categoría sea válida.
        if (!contenedorProductos || !categoriaActual) {
            console.error('No se encontró el contenedor o la categoría actual.');
            return;
        }

        try {

            // Consultamos los productos mediante la ruta GET que creamos en Express.
            // De esta forma dejamos de utilizar la API externa del proyecto de AW1.
            const respuesta = await fetch('/api/productos');

            if (!respuesta.ok) {
                throw new Error(`No se pudieron consultar productos (${respuesta.status})`);
            }

            // Convertimos la respuesta del servidor en un arreglo de JavaScript.
            const productos = await respuesta.json();

            if (!Array.isArray(productos)) {
                throw new Error('El servidor no devolvió una lista de productos.');
            }

            // Mostramos únicamente los productos que correspondan a la categoría,
            // que estén disponibles y que tengan stock mayor a cero.
            const productosFiltrados = productos.filter(function (producto) {
                return producto.categoria === categoriaActual &&
                    producto.disponible === true &&
                    producto.stock > 0;
            });

            // Si la categoría no tiene productos disponibles, mostramos un mensaje.
            if (productosFiltrados.length === 0) {
                contenedorProductos.innerHTML =
                    '<p class="text-muted">No hay productos disponibles en esta categoría.</p>';
                return;
            }

            // Generamos las tarjetas utilizando el componente compartido.
            // Adaptamos los nombres de las propiedades del JSON al formato de la card.
            contenedorProductos.innerHTML = productosFiltrados.map(function (producto) {
                return crearCardProducto({
                    id: producto.id,
                    titulo: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    stock: producto.stock,
                    imagen: '/assets/img/' + producto.imagen
                });
            }).join('');

            // Usamos un solo evento para controlar los botones de todas las tarjetas.
            // Esto evita tener que agregar un evento individual por cada producto.
            contenedorProductos.addEventListener('click', function (evento) {

                const boton = evento.target.closest('button');

                if (!boton || !contenedorProductos.contains(boton)) {
                    return;
                }

                // Buscamos la tarjeta desde la cual se presionó el botón.
                const articulo = boton.closest('article');
                if (!articulo) return;

                // Recuperamos el ID guardado en el atributo data-id de la tarjeta.
                const idProducto = Number(articulo.dataset.id);

                // Buscamos el producto dentro del arreglo obtenido del servidor.
                const producto = productosFiltrados.find(function (item) {
                    return Number(item.id) === idProducto;
                });

                if (!producto) return;

                const indicadorCantidad = articulo.querySelector('.cantidad');
                const cantidad = Number(indicadorCantidad.textContent);

                // BOTÓN +
                // Aumentamos la cantidad sin superar el stock disponible.
                if (boton.classList.contains('btn-sumar')) {
                    if (cantidad >= producto.stock) {
                        alert('No hay más stock disponible');
                        return;
                    }

                    indicadorCantidad.textContent = cantidad + 1;
                    return;
                }

                // BOTÓN -
                // Disminuimos la cantidad sin permitir valores negativos.
                if (boton.classList.contains('btn-restar')) {
                    if (cantidad > 0) {
                        indicadorCantidad.textContent = cantidad - 1;
                    }
                    return;
                }

                // Si no se presionó el botón del carrito, no hacemos nada más.
                if (!boton.classList.contains('btn-agregar-carrito')) {
                    return;
                }

                // Verificamos que el usuario haya iniciado sesión.
                // El login guarda sus datos en sessionStorage.
                const usuarioLogueado = sessionStorage.getItem('usuarioLogueado');

                if (!usuarioLogueado) {
                    alert('Debes iniciar sesión para agregar productos al carrito');
                    window.location.href = '/pages/auth/login/login.html';
                    return;
                }

                // No permitimos agregar un producto con cantidad cero.
                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    alert('Seleccione una cantidad');
                    return;
                }

                // Recuperamos el carrito para actualizarlo.
                const carrito = leerCarritoCategoria();

                // Buscamos por ID y no por nombre, ya que distintos productos
                // podrían tener nombres iguales.
                const existente = carrito.find(function (item) {
                    return Number(item.id) === idProducto;
                });

                const cantidadAcumulada = existente
                    ? Number(existente.cantidad)
                    : 0;

                // Validamos la suma de lo que ya está en el carrito
                // y la nueva cantidad seleccionada.
                if (cantidadAcumulada + cantidad > producto.stock) {
                    alert('La cantidad supera el stock disponible');
                    return;
                }

                // Si el producto ya estaba agregado, solamente aumentamos su cantidad.
                // Si es nuevo, guardamos sus datos dentro del carrito.
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

                // Guardamos el carrito actualizado para conservarlo entre páginas.
                localStorage.setItem('carrito', JSON.stringify(carrito));

                // Reiniciamos la cantidad visible después de agregar el producto.
                indicadorCantidad.textContent = '0';

                alert('Producto agregado al carrito');
            });

        } catch (error) {

            // Si falla la consulta a Express mostramos el error en consola
            // y un mensaje dentro de la página.
            console.error('Error al cargar la categoría:', error);

            contenedorProductos.innerHTML =
                '<p class="alert alert-danger">No se pudieron cargar los productos.</p>';
        }
    }

    // Ejecutamos la carga cuando se abre la página.
    cargarProductosCategoria();

})();
