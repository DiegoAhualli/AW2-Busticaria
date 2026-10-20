/**
 * Rutas de usuarios de Busticaria.
 * Registro, inicio de sesión y eliminación de usuarios.
 * Los usuarios se identifican con un ID, que después se relaciona con las ventas.
 */
import express from 'express';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();
const scryptAsync = promisify(scrypt);
const archivoUsuarios = fileURLToPath(new URL('../../data/usuarios.json', import.meta.url));
const archivoVentas = fileURLToPath(new URL('../../data/ventas.json', import.meta.url));

// Convertimos la contraseña en un hash con una sal aleatoria.
// Así las cuentas nuevas no guardan la contraseña directamente en el JSON.
async function generarHash(password) {
    const sal = randomBytes(16).toString('hex');
    const clave = await scryptAsync(password, sal, 64);
    return `scrypt:${sal}:${clave.toString('hex')}`;
}

// Comprueba la contraseña recibida contra la que está guardada.
async function verificarPassword(password, passwordGuardada) {
    if (typeof passwordGuardada !== 'string') return false;

    // Esto mantiene la compatibilidad con las cuentas de ejemplo del TP1.
    // Es una solución temporal: esas contraseñas antiguas estaban en texto plano.
    if (!passwordGuardada.startsWith('scrypt:')) {
        return password === passwordGuardada;
    }

    // El formato del campo es scrypt:sal:hash.
    const partes = passwordGuardada.split(':');
    if (partes.length !== 3) return false;

    try {
        const claveGuardada = Buffer.from(partes[2], 'hex');
        if (claveGuardada.length !== 64) return false;

        const claveIngresada = await scryptAsync(password, partes[1], 64);
        // Comparamos los hashes sin utilizar una comparación común de strings.
        return timingSafeEqual(claveGuardada, claveIngresada);
    } catch (error) {
        return false;
    }
}

// Enviamos al navegador sólo los datos necesarios, nunca la contraseña.
function datosPublicos(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        activo: usuario.activo
    };
}

// POST /api/usuarios/login: valida email y contraseña desde Express.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        // Evitamos buscar usuarios con datos vacíos o de otro tipo.
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

        // Una cuenta inactiva no puede iniciar sesión.
        if (usuario.activo !== true) {
            return res.status(403).json({ mensaje: 'La cuenta se encuentra inactiva' });
        }

        // Si ingresó con una contraseña vieja, la convertimos a hash.
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

// POST /api/usuarios: registra una cuenta nueva en usuarios.json.
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body ?? {};

        // Se requiere un email válido y una contraseña de al menos ocho caracteres.
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

        // No permitimos dos usuarios registrados con el mismo email.
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

// DELETE /api/usuarios/:id: elimina únicamente usuarios sin ventas asociadas.
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

        // Evitamos eliminar un usuario que figure en una compra previa.
        // Así no dejamos ventas referenciando IDs que ya no existen.
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
