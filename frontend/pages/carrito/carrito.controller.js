const contenedorCarrito = document.getElementById("contenedorCarrito");
const btnRealizarCompra = document.getElementById("btnRealizarCompra");
const btnVolverComprar = document.getElementById("btnVolverComprar");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function obtenerPrecioNumerico(precio) {
    return parseFloat(precio.replace("$", ""));
}

function mostrarCarrito() {

    contenedorCarrito.innerHTML = "";

    if (carrito.length === 0) {

        contenedorCarrito.innerHTML = `
            <div class="col-12">
                <p class="alert alert-warning">
                    No hay productos en el carrito.
                </p>
            </div>
        `;

        return;
    }

    carrito.forEach(function(producto, indice) {

        contenedorCarrito.innerHTML += `
            <article class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${producto.imagen}" class="card-img-top product-card__img" alt="${producto.titulo}">

                    <div class="card-body">
                        <h3 class="card-title h5">${producto.titulo}</h3>

                        <p class="fw-bold">${producto.precio}</p>

                        <div class="d-flex align-items-center gap-2 mb-3">
                            <button class="btn btn-outline-secondary btn-restar-carrito" data-indice="${indice}" type="button">
                                -
                            </button>

                            <span>${producto.cantidad}</span>

                            <button class="btn btn-outline-secondary btn-sumar-carrito" data-indice="${indice}" type="button">
                                +
                            </button>
                        </div>

                        <button class="btn btn-danger btn-eliminar-producto" data-indice="${indice}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `;
    });

    activarBotonesCarrito();
}

function activarBotonesCarrito() {

    const botonesSumar = document.querySelectorAll(".btn-sumar-carrito");
    const botonesRestar = document.querySelectorAll(".btn-restar-carrito");
    const botonesEliminar = document.querySelectorAll(".btn-eliminar-producto");

    botonesSumar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const indice = boton.getAttribute("data-indice");

            carrito[indice].cantidad = parseInt(carrito[indice].cantidad) + 1;

            guardarCarrito();
            mostrarCarrito();
        });
    });

    botonesRestar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const indice = boton.getAttribute("data-indice");

            if (parseInt(carrito[indice].cantidad) > 1) {
                carrito[indice].cantidad = parseInt(carrito[indice].cantidad) - 1;
            } else {
                carrito.splice(indice, 1);
            }

            guardarCarrito();
            mostrarCarrito();
        });
    });

    botonesEliminar.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const indice = boton.getAttribute("data-indice");

            carrito.splice(indice, 1);

            guardarCarrito();
            mostrarCarrito();
        });
    });
}

btnRealizarCompra.addEventListener("click", function() {

    if (carrito.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    let resumen = "Resumen de compra:\n\n";
    let precioFinal = 0;

    carrito.forEach(function(producto) {

        const precioUnitario = obtenerPrecioNumerico(producto.precio);
        const cantidad = parseInt(producto.cantidad);
        const totalProducto = precioUnitario * cantidad;

        resumen += `${producto.titulo} x${cantidad} = $${totalProducto.toFixed(2)}\n`;

        precioFinal += totalProducto;
    });

    resumen += `\nPRECIO FINAL = $${precioFinal.toFixed(2)}`;
    resumen += "\n\n¿Desea aceptar la compra?";

    const confirmarCompra = confirm(resumen);

    if (!confirmarCompra) {
        return;
    }

    alert("Compra realizada con éxito!");

    localStorage.removeItem("carrito");

    carrito = [];

    mostrarCarrito();
});

btnVolverComprar.addEventListener("click", function() {

    const opcion = prompt(
        "Agregar más productos...\n\n" +
        "r - Ropa\n" +
        "t - Tecnología\n" +
        "h - Hogar"
    );

    if (!opcion) {
        return;
    }

    const opcionUsuario = opcion.toLowerCase();

    if (opcionUsuario === "r") {
        window.location.href = "../categories/categoria-ropa.html";
    } else if (opcionUsuario === "t") {
        window.location.href = "../categories/categoria-tecnologia.html";
    } else if (opcionUsuario === "h") {
        window.location.href = "../categories/categoria-hogar.html";
    } else {
        alert("Opción inválida.");
    }
});

mostrarCarrito();