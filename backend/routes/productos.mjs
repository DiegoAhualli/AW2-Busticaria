
import express from 'express';

import {
    listarProductos,
    obtenerProducto,
    agregarProducto,
    actualizarStock,
    eliminarProducto
} from '../controllers/productos.controller.mjs';

import {
    validarNuevoProducto,
    validarStock
} from '../middleware/validarProductos.mjs';

const router = express.Router();

// Lectura del catálogo completo.
router.get('/', listarProductos);

// Lectura individual por identificador numérico.
router.get('/:id', obtenerProducto);

// Alta con validación previa del cuerpo.
router.post('/', validarNuevoProducto, agregarProducto);

// Actualización parcial del stock.
router.put('/:id', validarStock, actualizarStock);

// Baja condicionada por las ventas relacionadas.
router.delete('/:id', eliminarProducto);

export default router;
