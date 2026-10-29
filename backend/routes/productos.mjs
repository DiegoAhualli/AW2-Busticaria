
import express from 'express';

import {
    listarProductos,
    agregarProducto,
    actualizarStock
} from '../controllers/productos.controller.mjs';

import {
    validarNuevoProducto,
    validarStock
} from '../middleware/validarProductos.mjs';

const router = express.Router();

// Obtener todos los productos
router.get('/', listarProductos);

// Registrar un producto nuevo
router.post('/', validarNuevoProducto, agregarProducto);

// Actualizar el stock de un producto
router.put('/:id', validarStock, actualizarStock);

export default router;
