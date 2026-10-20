const contenedorTecnologia = document.getElementById("productosTecnologiaHome");
const contenedorRopa = document.getElementById("productosRopaHome");
const contenedorHogar = document.getElementById("productosHogarHome");

async function cargarProductosHome() {

    const productos = await obtenerProductos();

    const productosTecnologia = productos.filter(function(producto) {
        return producto.category === "smartphones"
        || producto.category === "laptops";
    }).slice(0, 3);

    const productosRopa = productos.filter(function(producto) {
        return producto.category === "mens-shirts"
        || producto.category === "womens-dresses";
    }).slice(0, 3);

    const productosHogar = productos.filter(function(producto) {
        return producto.category === "furniture"
        || producto.category === "home-decoration";
    }).slice(0, 3);

    contenedorTecnologia.innerHTML = "";
    contenedorRopa.innerHTML = "";
    contenedorHogar.innerHTML = "";

    productosTecnologia.forEach(function(producto) {
        contenedorTecnologia.innerHTML += crearCardProducto({
            titulo: producto.title,
            descripcion: producto.description,
            precio: producto.price,
            imagen: producto.thumbnail
        });
    });

    productosRopa.forEach(function(producto) {
        contenedorRopa.innerHTML += crearCardProducto({
            titulo: producto.title,
            descripcion: producto.description,
            precio: producto.price,
            imagen: producto.thumbnail
        });
    });

    productosHogar.forEach(function(producto) {
        contenedorHogar.innerHTML += crearCardProducto({
            titulo: producto.title,
            descripcion: producto.description,
            precio: producto.price,
            imagen: producto.thumbnail
        });
    });

    const botonesSumar = document.querySelectorAll(".btn-sumar");
    const botonesRestar = document.querySelectorAll(".btn-restar");
    const botonesCarrito = document.querySelectorAll(".btn-agregar-carrito");

    botonesSumar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const cantidad = boton.parentElement.querySelector(".cantidad");
            cantidad.textContent = parseInt(cantidad.textContent) + 1;
        });
    });

    botonesRestar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const cantidad = boton.parentElement.querySelector(".cantidad");
            const valorActual = parseInt(cantidad.textContent);

            if (valorActual > 0) {
                cantidad.textContent = valorActual - 1;
            }
        });
    });

    botonesCarrito.forEach(function(boton) {
        boton.addEventListener("click", function() {

            const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");

            if (!usuarioLogueado) {
                alert("Debes iniciar sesión para agregar productos al carrito");
                window.location.href = "auth/login/login.html";
                return;
            }

            const cantidad = boton.parentElement.querySelector(".cantidad").textContent;

            if (cantidad == 0) {
                alert("Seleccione una cantidad");
                return;
            }

            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            const card = boton.closest(".card-body");

            const cardCompleta = boton.closest(".card");

            const producto = {
                titulo: card.querySelector(".card-title").textContent,
                precio: card.querySelector(".fw-bold").textContent,
                cantidad: cantidad,
                imagen: cardCompleta.querySelector("img").src
            };

            const productoExistente = carrito.find(function(item) {
                return item.titulo === producto.titulo;
            });

            if (productoExistente) {
                productoExistente.cantidad =
                parseInt(productoExistente.cantidad) + parseInt(producto.cantidad);
            } else {
                carrito.push(producto);
            }

            localStorage.setItem("carrito", JSON.stringify(carrito));

            boton.parentElement.querySelector(".cantidad").textContent = 0;

            alert("Producto agregado al carrito");
        });
    });
}

cargarProductosHome();