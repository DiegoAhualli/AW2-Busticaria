export class ErrorHTTP extends Error {
    constructor(estado, mensaje) {
        super(mensaje);
        this.name = 'ErrorHTTP';
        this.estado = estado;
    }
}
