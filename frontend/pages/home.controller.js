
const contenedorTecnologia = document.getElementById("productosTecnologiaHome");
const contenedorRopa = document.getElementById("productosRopaHome");
const contenedorHogar = document.getElementById("productosHogarHome");

async function cargarProductosHome() {
    try {
        // Obtener productos desde servidor Express
        const respuesta = await fetch("http://localhost:3000/productos");

        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos");
        }

        const productos = await respuesta.json();

        // Filtrar productos disponibles por categoría
        const productosTecnologia = productos.filter(function(producto) {
            return producto.categoria === "tecnologia" && producto.disponible;
        });

        const productosRopa = productos.filter(function(producto) {
            return producto.categoria === "ropa" && producto.disponible;
        });

        const productosHogar = productos.filter(function(producto) {
            return producto.categoria === "hogar" && producto.disponible;
        });

        // Limpiar los contenedores
        contenedorTecnologia.innerHTML = "";
        contenedorRopa.innerHTML = "";
        contenedorHogar.innerHTML = "";

        // Mostrar productos utilizando las cards
        function mostrarProductos(lista, contenedor) {
            lista.forEach(function(producto) {
                contenedor.innerHTML += crearCardProducto({
                    id: producto.id,
                    titulo: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    imagen: "../assets/img/" + producto.imagen
                });
            });
        }

        mostrarProductos(productosTecnologia, contenedorTecnologia);
        mostrarProductos(productosRopa, contenedorRopa);
        mostrarProductos(productosHogar, contenedorHogar);

        // Botones para aumentar cantidades
        const botonesSumar = document.querySelectorAll(".btn-sumar");

        botonesSumar.forEach(function(boton) {
            boton.addEventListener("click", function() {
                const cantidad = boton.parentElement.querySelector(".cantidad");
                cantidad.textContent = parseInt(cantidad.textContent) + 1;
            });
        });

        // Botones para disminuir cantidades
        const botonesRestar = document.querySelectorAll(".btn-restar");

        botonesRestar.forEach(function(boton) {
            boton.addEventListener("click", function() {
                const cantidad = boton.parentElement.querySelector(".cantidad");
                const valorActual = parseInt(cantidad.textContent);

                if (valorActual > 0) {
                    cantidad.textContent = valorActual - 1;
                }
            });
        });

        // Botones para agregar productos al carrito
        const botonesCarrito = document.querySelectorAll(".btn-agregar-carrito");

        botonesCarrito.forEach(function(boton) {
            boton.addEventListener("click", function() {

                const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");

                if (!usuarioLogueado) {
                    alert("Debes iniciar sesión para agregar productos al carrito");
                    window.location.href = "auth/login/login.html";
                    return;
                }

                const cantidad = parseInt(
                    boton.parentElement.querySelector(".cantidad").textContent
                );

                if (cantidad === 0) {
                    alert("Seleccione una cantidad");
                    return;
                }

                const card = boton.closest(".card");
                const idProducto = Number(card.closest("article").dataset.id);

                const productoOriginal = productos.find(function(producto) {
                    return producto.id === idProducto;
                });

                if (!productoOriginal) {
                    alert("No se encontró el producto");
                    return;
                }

                // Comprobar stock disponible
                if (cantidad > productoOriginal.stock) {
                    alert("No hay suficiente stock disponible");
                    return;
                }

                const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

                const productoExistente = carrito.find(function(item) {
                    return item.id === productoOriginal.id;
                });

                if (productoExistente) {
                    if (parseInt(productoExistente.cantidad) + cantidad > productoOriginal.stock) {
                        alert("La cantidad supera el stock disponible");
                        return;
                    }

                    productoExistente.cantidad =
                        parseInt(productoExistente.cantidad) + cantidad;
                } else {
                    carrito.push({
                        id: productoOriginal.id,
                        titulo: productoOriginal.nombre,
                        precio: productoOriginal.precio,
                        cantidad: cantidad,
                        imagen: card.querySelector("img").src
                    });
                }

                localStorage.setItem("carrito", JSON.stringify(carrito));

                boton.parentElement.querySelector(".cantidad").textContent = 0;

                alert("Producto agregado al carrito");
            });
        });

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert("No se pudieron cargar los productos");
    }
}

// Ejecutar cuando se carga la página
cargarProductosHome();
