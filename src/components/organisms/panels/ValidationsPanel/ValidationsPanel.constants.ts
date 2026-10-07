export const BASIC_RULES_DESCRIPTION: string =
  "Lo que el valor tiene que cumplir para poder pasar al paso siguiente. Todo se traduce al esquema Zod de abajo, que es lo único con lo que valida el aplicativo.";

export const DATE_BOUNDS_DESCRIPTION: string =
  "Lo más temprano y lo más tarde que se acepta. Hoy, Hace… y Dentro de… se cuentan desde el día en que el contribuyente llena el formulario, así que la regla sigue valiendo años después de exportarla. En un rango, No antes de se aplica a la fecha inicial y No después de a la final. Con hora, el límite es por día: No después de Hoy acepta hoy a cualquier hora.";

export const FORMAT_DESCRIPTION: string =
  "Una expresión regular que el texto tiene que cumplir y el mensaje que se muestra cuando no la cumple. Una expresión mal escrita bloquea la exportación.";

// Solo se suma en telefono y correo, que traen su propio formato.
export const BUILT_IN_FORMAT_DESCRIPTION: string =
  "Este tipo ya trae su formato: vacía, se usa el de fábrica, que se ve en el esquema de abajo. Una expresión propia lo reemplaza entero.";

// Solo se suma en campos numericos, que son los unicos con Maximo de digitos.
export const MAX_DIGITS_DESCRIPTION: string =
  "Máximo de dígitos cuenta los de la parte entera. Los puntos de miles, la coma decimal y el signo no cuentan.";
