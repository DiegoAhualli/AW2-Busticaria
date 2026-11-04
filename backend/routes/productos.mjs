
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

// GET - Obtener todos los productos
router.get('/', listarProductos);

// POST - Registrar un producto nuevo
router.post('/', validarNuevoProducto, agregarProducto);

// PUT - Actualizar el stock de un producto
router.put('/:id', validarStock, actualizarStock);

export default router;
