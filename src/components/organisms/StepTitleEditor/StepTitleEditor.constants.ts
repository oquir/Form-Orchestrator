export const HIDDEN_STEP_DESCRIPTION: string =
  "El contribuyente no ve este paso: al dar Siguiente se salta. Pero sus campos siguen existiendo: los calculados se siguen calculando, los demás quedan vacíos, y todos viajan en el payload.\nSirve para quitar un paso que el municipio no quiere sin dejar en cero los totales que dependen de él, como el paso 7 y el total a pagar con aporte voluntario.\nNo pongas campos obligatorios aquí: nadie los puede llenar.";

export const HIDDEN_STEP_NOTE: string =
  "Oculto: no se muestra ni se navega, pero sus campos calculan y viajan en el payload.";

// relative ancla la burbuja del (i) a la fila: toma su ancho, el del bloque.
export const OPTION_ROW_CLASSES: string = "relative flex items-center justify-between gap-2";

export const OPTION_CONTROL_CLASSES: string = "flex items-center gap-2";
