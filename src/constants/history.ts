// Cuantos pasos guarda el historial. Cada paso son referencias al documento de ese momento -el store
// es inmutable y comparte estructura-, asi que cien cuestan poco mas que uno.
export const HISTORY_LIMIT: number = 100;

// Cambios mas juntos que esto son una sola rafaga y se deshacen de una vez: teclear una etiqueta o un
// script no deja un paso por tecla. Es una ventana que se corre con cada cambio, no un reloj fijo:
// mientras se siga tecleando sin pausas, la rafaga sigue abierta.
export const HISTORY_BURST_MS: number = 500;
