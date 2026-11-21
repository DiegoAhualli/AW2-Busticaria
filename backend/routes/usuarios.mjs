
import express from 'express';

import {
    iniciarSesion,
    registrarUsuario,
    eliminarUsuario
} from '../controllers/usuarios.controller.mjs';

const router = express.Router();

// Autenticación y emisión del JWT.
router.post('/login', iniciarSesion);

// Registro de una cuenta nueva.
router.post('/', registrarUsuario);

// Baja condicionada por las ventas relacionadas.
router.delete('/:id', eliminarUsuario);

export default router;
