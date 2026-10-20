const contenedorProductos = document.getElementById("contenedorProductos");

/*
const productos = [
    {
        titulo: "Remera Oversize",
        descripcion: "Remera urbana de algodón.",
        precio: 15000,
        imagen: "../../assets/img/remera.webp",
        categoria: "ropa"
    },
    {
        titulo: "Campera Negra",
        descripcion: "Campera cómoda para uso diario.",
        precio: 42000,
        imagen: "../../assets/img/campera.webp",
        categoria: "ropa"
    },
    {
    titulo: "Playstation 5",
    descripcion: "Consola de videojuegos de última generación con gráficos impresionantes y rendimiento excepcional. Bundle Gran Turismo 7.",
    precio: 500000,
    imagen: "../../assets/img/ps5.webp",
    categoria: "tecnologia",
    destacado: true
    },
    {
        titulo: "Auriculares Bluetooth",
        descripcion: "Auriculares inalámbricos con buena autonomía.",
        precio: 35000,
        imagen: "../../assets/img/auriculares.webp",
        categoria: "tecnologia"
    },
    {
        titulo: "Mouse Gamer",
        descripcion: "Mouse óptico con diseño ergonómico.",
        precio: 18000,
        imagen: "../../assets/img/mouse.webp",
        categoria: "tecnologia"
    },
    {
        titulo: "Lámpara de Mesa",
        descripcion: "Lámpara decorativa para el hogar.",
        precio: 22000,
        imagen: "../../assets/img/lampara.webp",
        categoria: "hogar"
    },
    {
        titulo: "Almohadón Decorativo",
        descripcion: "Almohadón suave para sillón o cama.",
        precio: 12000,
        imagen: "../../assets/img/almohadon.webp",
        categoria: "hogar"
    }
];
*/

let categoriaActual = "";

if (window.location.pathname.includes("categoria-ropa")) {
    categoriaActual = "ropa";
} else if (window.location.pathname.includes("categoria-tecnologia")) {
    categoriaActual = "tecnologia";
} else if (window.location.pathname.includes("categoria-hogar")) {
    categoriaActual = "hogar";
}

async function cargarProductos() {

    const productos = await obtenerProductos();

    const productosFiltrados = productos.filter(function(producto) {

        if (categoriaActual === "tecnologia") {
            return producto.category === "smartphones"
            || producto.category === "laptops";
        }

        if (categoriaActual === "hogar") {
            return producto.category === "furniture"
            || producto.category === "home-decoration";
        }

        if (categoriaActual === "ropa") {
            return producto.category === "mens-shirts"
            || producto.category === "womens-dresses";
        }

    });

    productosFiltrados.forEach(function(producto) {

        contenedorProductos.innerHTML += crearCardProducto({
            titulo: producto.title,
            descripcion: producto.description,
            precio: producto.price,
            imagen: producto.thumbnail
        });

    });

    const botonesSumar = document.querySelectorAll(".btn-sumar");
    const botonesRestar = document.querySelectorAll(".btn-restar");

    botonesSumar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const cantidad = boton.parentElement.querySelector(".cantidad");
            cantidad.textContent = parseInt(cantidad.textContent) + 1;
        });
    });

    botonesRestar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const cantidad = boton.parentElement.querySelector(".cantidad");
            let valorActual = parseInt(cantidad.textContent);

            if (valorActual > 0) {
                cantidad.textContent = valorActual - 1;
            }
        });
    });

    const botonesCarrito = document.querySelectorAll(".btn-agregar-carrito");

    botonesCarrito.forEach(function(boton){

        boton.addEventListener("click",function(){

            const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");

            if (!usuarioLogueado) {

                alert("Debes iniciar sesión para agregar productos al carrito");

                window.location.href = "../auth/login/login.html";

                return;
            }

            const cantidad =
            boton.parentElement
            .querySelector(".cantidad")
            .textContent;

            if(cantidad == 0){

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

cargarProductos();