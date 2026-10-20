import express from 'express';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();
const scryptAsync = promisify(scrypt);
const archivoUsuarios = fileURLToPath(new URL('../../data/usuarios.json', import.meta.url));
const archivoVentas = fileURLToPath(new URL('../../data/ventas.json', import.meta.url));

// Transformar una contraseña en un hash con sal (sin instalar librerías).
async function generarHash(password) {
    const sal = randomBytes(16).toString('hex');
    const clave = await scryptAsync(password, sal, 64);
    return `scrypt:${sal}:${clave.toString('hex')}`;
}

async function verificarPassword(password, passwordGuardada) {
    if (typeof passwordGuardada !== 'string') return false;

    // Compatibilidad temporal con los usuarios de ejemplo del TP1.
    if (!passwordGuardada.startsWith('scrypt:')) {
        return password === passwordGuardada;
    }

    const partes = passwordGuardada.split(':');
    if (partes.length !== 3) return false;

    try {
        const claveGuardada = Buffer.from(partes[2], 'hex');
        if (claveGuardada.length !== 64) return false;

        const claveIngresada = await scryptAsync(password, partes[1], 64);
        return timingSafeEqual(claveGuardada, claveIngresada);
    } catch (error) {
        return false;
    }
}

function datosPublicos(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        activo: usuario.activo
    };
}

// POST /api/usuarios/login - Validar credenciales en el backend.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password) {
            return res.status(400).json({ mensaje: 'Ingresá email y contraseña' });
        }

        const usuarios = await leerJSON(archivoUsuarios);
        const usuario = usuarios.find(u =>
            typeof u.email === 'string' &&
            u.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!usuario || !(await verificarPassword(password, usuario.password))) {
            return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        if (usuario.activo !== true) {
            return res.status(403).json({ mensaje: 'La cuenta se encuentra inactiva' });
        }

        // Migrar automáticamente la contraseña antigua de prueba a un hash.
        if (!usuario.password.startsWith('scrypt:')) {
            usuario.password = await generarHash(password);
            await guardarJSON(archivoUsuarios, usuarios);
        }

        return res.status(200).json({
            mensaje: 'Inicio de sesión correcto',
            usuario: datosPublicos(usuario)
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ mensaje: 'Error interno al iniciar sesión' });
    }
});

// POST /api/usuarios - Registrar una cuenta nueva.
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body ?? {};

        if (typeof nombre !== 'string' || !nombre.trim() ||
            typeof apellido !== 'string' || !apellido.trim() ||
            typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                mensaje: 'Ingresá nombre, apellido, email válido y contraseña de al menos 8 caracteres'
            });
        }

        const usuarios = await leerJSON(archivoUsuarios);
        const emailNormalizado = email.trim().toLowerCase();

        if (usuarios.some(u => u.email.toLowerCase() === emailNormalizado)) {
            return res.status(409).json({ mensaje: 'El email ya está registrado' });
        }

        const nuevoUsuario = {
            id: Math.max(0, ...usuarios.map(u => u.id)) + 1,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNormalizado,
            password: await generarHash(password),
            activo: true
        };

        usuarios.push(nuevoUsuario);
        await guardarJSON(archivoUsuarios, usuarios);

        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: datosPublicos(nuevoUsuario)
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno al registrar usuario' });
    }
});

// DELETE /api/usuarios/:id - Mantener la integridad con las ventas del TP2.
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ mensaje: 'El ID es incorrecto' });
        }

        const usuarios = await leerJSON(archivoUsuarios);
        const ventas = await leerJSON(archivoVentas);
        const usuario = usuarios.find(u => u.id === id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (ventas.some(venta => venta.id_usuario === id)) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el usuario porque tiene ventas registradas'
            });
        }

        await guardarJSON(archivoUsuarios, usuarios.filter(u => u.id !== id));
        return res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
});

export default router;
