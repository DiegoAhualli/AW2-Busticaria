import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const directorioActual = path.dirname(fileURLToPath(import.meta.url));
export const rutaEnv = path.resolve(directorioActual, '../../.env');

dotenv.config({ path: rutaEnv, quiet: true });

export function obtenerMongoUri() {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
        throw new Error('Falta la variable de entorno MONGODB_URI');
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        throw new Error('MONGODB_URI no tiene un formato válido');
    }

    return uri;
}

export function obtenerJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();

    if (!secret) {
        throw new Error('Falta la variable de entorno JWT_SECRET');
    }

    if (secret.length < 32) {
        throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
    }

    return secret;
}

export function obtenerPuerto() {
    const valor = process.env.PORT?.trim() || '3000';
    const puerto = Number(valor);

    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
        throw new Error('PORT debe ser un número entre 1 y 65535');
    }

    return puerto;
}
