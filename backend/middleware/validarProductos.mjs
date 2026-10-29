
// Validar los datos antes de registrar un producto
export function validarNuevoProducto(req, res, next) {

    const { nombre, descripcion, categoria, precio, stock, imagen } = req.body ?? {};

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof descripcion !== 'string' || !descripcion.trim() ||
        typeof categoria !== 'string' || !categoria.trim() ||
        typeof imagen !== 'string' || !imagen.trim() ||
        typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0 ||
        !Number.isInteger(stock) || stock < 0
    ) {
        return res.status(400).json({
            mensaje: 'Los datos del producto son incorrectos'
        });
    }

    next();
}

// Validar ID y stock antes de actualizar
export function validarStock(req, res, next) {

    const id = Number(req.params.id);
    const { stock } = req.body ?? {};

    if (
        !Number.isInteger(id) || id <= 0 ||
        !Number.isInteger(stock) || stock < 0
    ) {
        return res.status(400).json({
            mensaje: 'El ID o el stock son incorrectos'
        });
    }

    next();
}
