export const HINT_CLASSES: string = "text-[11px] text-fg-subtle";

export const ERROR_CLASSES: string = "text-[11px] text-danger";

export const PRELUDE_PLACEHOLDER: string =
  "function tarifaEspecial(base, tarifa) {\n  if (base > 100000000) return tarifa * 1.2;\n  return tarifa;\n}";

export const PRELUDE_HINT: string =
  "Se antepone al script de todos los campos, así que lo que declares acá está en ámbito en cualquiera de ellos. Para los cálculos que se repiten en varios renglones.";

export const PRELUDE_SCOPE_HINT: string =
  "No puede leer campos: {campo} no vale acá, porque fuera de un campo —y sobre todo dentro de un grupo repetible— no hay una única respuesta a cuál sería su valor. Los valores entran por parámetro.";
