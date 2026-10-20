
function escaparHTMLCard(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, function(caracter) {
        const entidades = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return entidades[caracter];
    });
}

function crearCardProducto(producto) {
    const precioFormateado = Number(producto.precio).toLocaleString('es-AR');
    const stockHTML = Number.isInteger(producto.stock)
        ? `<p class="text-muted small">Stock disponible: ${producto.stock}</p>`
        : '';

    return `
        <article class="col-md-4 mb-4" data-id="${Number(producto.id)}">
            <div class="card h-100 shadow-sm">
                <img src="${escaparHTMLCard(producto.imagen)}"
                     class="card-img-top"
                     alt="${escaparHTMLCard(producto.titulo)}"
                     onerror="this.onerror=null;this.src='/assets/img/logo.webp';">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5">${escaparHTMLCard(producto.titulo)}</h3>
                    <p class="card-text">${escaparHTMLCard(producto.descripcion)}</p>
                    <p class="fw-bold">$${precioFormateado}</p>
                    ${stockHTML}
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <button class="btn btn-outline-secondary btn-restar" type="button">-</button>
                        <span class="cantidad">0</span>
                        <button class="btn btn-outline-secondary btn-sumar" type="button">+</button>
                    </div>
                    <button class="btn btn-busticaria btn-agregar-carrito mt-auto" type="button">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </article>
    `;
}
