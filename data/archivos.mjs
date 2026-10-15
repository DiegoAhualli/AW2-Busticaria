
import fs from 'node:fs/promises';

// Leer un archivo JSON
export async function leerJSON(archivo) {
    const datos = await fs.readFile(archivo, 'utf-8');
    return JSON.parse(datos);
}

// Guardar un archivo JSON
export async function guardarJSON(archivo, datos) {
    await fs.writeFile(
        archivo,
        JSON.stringify(datos, null, 2),
        'utf-8'
    );
}
