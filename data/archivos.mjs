
import fs from 'node:fs/promises';

// Utilidad compartida para leer los archivos JSON de respaldo.
export async function leerJSON(archivo) {

    const datos = await fs.readFile(archivo, 'utf-8');

    return JSON.parse(datos);
}

// La indentación de dos espacios mantiene los archivos legibles en el repositorio.
export async function guardarJSON(archivo, datos) {

    await fs.writeFile(
        archivo,
        JSON.stringify(datos, null, 2),
        'utf-8'
    );
}
