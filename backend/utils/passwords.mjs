import bcrypt from 'bcrypt';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const RONDAS_BCRYPT = 10;

export function esHashBcrypt(valor) {
    return typeof valor === 'string' && /^\$2[aby]\$\d{2}\$/.test(valor);
}

export function esHashScrypt(valor) {
    return typeof valor === 'string' && valor.startsWith('scrypt:');
}

export async function generarHashBcrypt(password) {
    return bcrypt.hash(password, RONDAS_BCRYPT);
}

async function compararTextoSeguro(password, valorGuardado) {
    const ingresada = Buffer.from(password, 'utf8');
    const guardada = Buffer.from(valorGuardado, 'utf8');

    if (ingresada.length !== guardada.length) return false;
    return timingSafeEqual(ingresada, guardada);
}

async function compararScrypt(password, hashGuardado) {
    const partes = hashGuardado.split(':');

    if (partes.length !== 3 || !/^[a-f\d]+$/i.test(partes[1])) {
        return false;
    }

    try {
        const claveGuardada = Buffer.from(partes[2], 'hex');

        if (claveGuardada.length !== 64) return false;

        const claveIngresada = await scryptAsync(password, partes[1], 64);
        return timingSafeEqual(claveGuardada, claveIngresada);
    } catch {
        return false;
    }
}

export async function verificarPassword(password, valorGuardado) {
    if (typeof password !== 'string' || typeof valorGuardado !== 'string') {
        return { valida: false, requiereRehash: false, formato: 'invalido' };
    }

    if (esHashBcrypt(valorGuardado)) {
        return {
            valida: await bcrypt.compare(password, valorGuardado),
            requiereRehash: false,
            formato: 'bcrypt'
        };
    }

    if (esHashScrypt(valorGuardado)) {
        return {
            valida: await compararScrypt(password, valorGuardado),
            requiereRehash: true,
            formato: 'scrypt'
        };
    }

    return {
        valida: await compararTextoSeguro(password, valorGuardado),
        requiereRehash: true,
        formato: 'texto-plano-historico'
    };
}
