function crearCardProducto(producto) {
    return `
        <article class="col-md-4 mb-4" id="${producto.destacado ? 'Playstation 5' : ''}">
            <div class="card h-100 shadow-sm">

                <img src="${producto.imagen}" 
                class="card-img-top"
                alt="${producto.titulo}">

                <div class="card-body d-flex flex-column">

                    <h3 class="card-title h5">
                        ${producto.titulo}
                    </h3>

                    <p class="card-text">
                        ${producto.descripcion}
                    </p>

                    <p class="fw-bold">
                        $${producto.precio}
                    </p>

                    <div class="d-flex align-items-center gap-2 mb-3">

                        <button 
                        class="btn btn-outline-secondary btn-restar"
                        type="button">

                        -

                        </button>

                        <span class="cantidad">
                            0
                        </span>

                        <button
                        class="btn btn-outline-secondary btn-sumar"
                        type="button">

                        +

                        </button>

                    </div>

                    <button
                    class="btn btn-busticaria btn-agregar-carrito mt-auto"
                    type="button">

                    Agregar al carrito

                    </button>

                </div>

            </div>
        </article>
    `;
}