export const BASIC_RULES_DESCRIPTION: string =
  "Lo que el valor tiene que cumplir para poder pasar al paso siguiente. Todo se traduce al esquema Zod de abajo, que es lo único con lo que valida el aplicativo.";

export const FORMAT_DESCRIPTION: string =
  "Una expresión regular que el texto tiene que cumplir y el mensaje que se muestra cuando no la cumple. Una expresión mal escrita bloquea la exportación.";

// Solo se suma en campos numericos, que son los unicos con Maximo de digitos.
export const MAX_DIGITS_DESCRIPTION: string =
  "Máximo de dígitos cuenta los de la parte entera. Los puntos de miles, la coma decimal y el signo no cuentan.";
