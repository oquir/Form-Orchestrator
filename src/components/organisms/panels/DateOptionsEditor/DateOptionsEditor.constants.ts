export const DATE_DESCRIPTION: string =
  "Si el usuario elige una sola fecha o un rango con fecha inicial y final, y si además tiene que indicar la hora.";

export const TIME_DESCRIPTION: string =
  'Solo cuando el municipio lo pide. El usuario escoge también la hora, en la fecha única o en las dos puntas del rango, y el valor pasa de AAAA-MM-DD a AAAA-MM-DDTHH:mm. Es la hora del reloj del contribuyente, sin zona horaria. Las condiciones "es igual a" sobre este campo comparan fecha y hora exactas.';

export const FORMAT_DESCRIPTION: string =
  "Cómo ve la fecha quien llena el formulario y cómo la recibe la API si el campo está mapeado: es el mismo formato en los dos lados. Por dentro el valor sigue siendo AAAA-MM-DD, así que las validaciones, los límites, las condiciones y los scripts no cambian. Con un formato elegido el usuario escribe la fecha y los separadores se ponen solos; el calendario se abre con el botón. Del navegador usa su selector de siempre, en su idioma, y manda AAAA-MM-DD.";

export const FORMAT_SELECT_CLASSES: string =
  "rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

// El ejemplo que se muestra debajo del formato. Un 31 para que se note cual es el dia y cual el mes.
export const SAMPLE_DATE: string = "2025-03-31";

export const SAMPLE_DATETIME: string = "2025-03-31T14:30";

export const OPTION_ROW_CLASSES: string = "relative flex items-center justify-between gap-2";

// El (i) va al final de la fila, despues del control, como en el encabezado de PanelSection.
export const OPTION_CONTROL_CLASSES: string = "flex items-center gap-2";

export const RANGE_DESCRIPTION: string =
  "Muestra dos fechas, Desde y Hasta, y la final no puede ser anterior a la inicial. Cambia el valor, no solo cómo se ve: en vez de una fecha viaja un objeto { desde, hasta }, cada punta en el mismo formato que una fecha única. Por eso las condiciones sobre este campo solo pueden preguntar si está vacío o tiene un valor.";

export const MODE_CHOICES: { range: boolean; label: string }[] = [
  { range: false, label: "Fecha única" },
  { range: true, label: "Rango de fechas" },
];

export const MODE_TRACK_CLASSES: string =
  "grid grid-cols-2 gap-0.5 rounded-md border border-border bg-field p-[3px]";

export const MODE_ITEM_BASE_CLASSES: string =
  "rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer";

export const MODE_ITEM_ACTIVE_CLASSES: string = "bg-brand text-on-brand shadow-sm";

export const MODE_ITEM_INACTIVE_CLASSES: string =
  "text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset";
