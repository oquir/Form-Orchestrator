export const SOURCE_BADGE_CLASSES: string =
  "rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted";

export const SOURCE_LINK_CLASSES: string =
  "self-start text-xs font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover";

// Estaba debajo del nombre tecnico, en FieldNameInput; es la unica explicacion de la seccion.
export const GENERAL_DESCRIPTION: string =
  "Con este nombre lo referencian las fórmulas y el formulario generado. Se normaliza a minúsculas con guiones bajos y tiene que ser único en todo el formulario.";

export const PLACEHOLDER_DESCRIPTION: string =
  'El texto gris que se ve dentro del campo mientras está vacío, como pista de qué escribir: "Ej: 900123456" o "Sin puntos ni guiones". Desaparece en cuanto el contribuyente escribe.\nEs solo presentación: no se guarda como valor, no viaja en el payload y no cuenta como respuesta, así que un campo obligatorio vacío sigue sin pasar aunque se vea algo escrito.\nEn un select reemplaza al "Seleccionar…" de la primera opción.';

export const PLACEHOLDER_EXAMPLE: string = "Ej: Ingrese el NIT sin dígito de verificación";

export const LAYOUT_DESCRIPTION: string =
  "Cuánto ocupa el campo dentro de su fila, en columnas de la grilla. Para cambiarlo de lugar arrastralo en el lienzo; con Shift elegís la columna exacta donde empieza.";

export const OPTIONS_SOURCE_DESCRIPTION: string =
  "De dónde salen las opciones de esta lista. Solo se escriben a mano en un campo excluido del payload y sin catálogo; en los demás las trae el aplicativo que recibe el JSON.";
