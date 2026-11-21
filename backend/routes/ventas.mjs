
import express from 'express';

import {
    listarVentas,
    crearVenta
} from '../controllers/ventas.controller.mjs';
import { autenticarJWT } from '../middleware/autenticarJWT.mjs';

const router = express.Router();

// Consulta del historial persistido.
router.get('/', listarVentas);

// El middleware verifica el JWT antes de registrar la compra.
router.post('/', autenticarJWT, crearVenta);

export default router;
