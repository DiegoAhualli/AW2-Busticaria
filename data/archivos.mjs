
import fs from 'node:fs/promises';

// En este archivo guardamos las funciones para trabajar con los JSON.
// De esta forma no tenemos que repetir el código de lectura y escritura
// en cada una de las rutas del servidor.

// Leer un archivo JSON
export async function leerJSON(archivo) {

    // Leemos el contenido del archivo como texto.
    const datos = await fs.readFile(archivo, 'utf-8');

    // Convertimos el texto JSON en un objeto o arreglo de JavaScript.
    return JSON.parse(datos);
}

// Guardar un archivo JSON
export async function guardarJSON(archivo, datos) {

    // Convertimos los datos de JavaScript a formato JSON.
    // El null y el 2 permiten que el archivo quede ordenado e indentado.
    await fs.writeFile(
        archivo,
        JSON.stringify(datos, null, 2),
        'utf-8'
    );
}
