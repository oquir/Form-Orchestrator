export const TIPO_DOCUMENTO_NIT: string = "2";

// Solo digitos, con un largo entre min y max, y ademas descarta los valores de mentira que la
// gente escribe para pasar de pantalla. Tres piezas:
//   (?!0)            no arranca en cero: ni un documento ni un telefono colombiano lo hacen, y de
//                    paso mata los 0000000 y los 0000001, que el chequeo de repetidos no alcanza.
//   (?!([0-9])\1+$)  no son todos el mismo digito: 1111111, 99999999, etc. La captura pide un
//                    digito y \1+ exige que lo que sigue hasta el final sea ese mismo.
//   [0-9]{min,max}   la longitud, dentro del patron y no en minLength/maxLength, para que un valor
//                    mal escrito de un unico mensaje en vez de tres.
// El \1 se escribe \\1 aca a proposito: el patron viaja al consumidor dentro de un string que
// este ejecuta con new Function, asi que la barra pasa por JSON.stringify y por el parser de JS
// antes de llegar al RegExp. Por eso mismo los digitos van como [0-9] y no como \d: donde se
// puede evitar una barra invertida, se evita.
//
// Se arma con una funcion en vez de repetir el texto en cada constante: los tres patrones solo se
// diferencian en el largo, y copiarlos es la manera de que en un mes uno tenga el lookahead y
// otro no.
function digitosSinRellenos(min: number, max: number): string {
  return `^(?!0)(?!([0-9])\\1+$)[0-9]{${min},${max}}$`;
}

export const DOCUMENTO_PATTERN: string = digitosSinRellenos(6, 10);

// Un NIT son 9 digitos: el decimo es el digito de verificacion, y ese va en su propio campo.
export const NIT_PATTERN: string = digitosSinRellenos(6, 9);

// Un celular colombiano son 10 digitos; el piso en 7 deja pasar los fijos viejos, que es lo que
// mas de un contribuyente sigue escribiendo aca.
export const TELEFONO_PATTERN: string = digitosSinRellenos(7, 10);

export const DOCUMENTO_MESSAGE: string = "Ingrese un documento válido";

export const TELEFONO_MESSAGE: string = "Ingrese un teléfono válido";

// El mensaje cuelga del .regex(), y la variante de NIT tiene un solo regex: este texto sale igual
// si escribieron diez digitos, letras o todos iguales. Por eso nombra el DV sin afirmar que ese
// fue el error -- "sin el digito de verificacion" es una instruccion, no un diagnostico.
export const NIT_MESSAGE: string = "Ingrese un NIT válido, sin el dígito de verificación";

export const SALDO_NETO: string =
  "total_impuesto_a_cargo - valor_exencion_exoneracion_impuesto - retenciones_a_favor - autorretenciones_a_favor - anticipo_liquidado_anio_anterior + anticipo_anio_siguiente + valor_sancion - saldo_favor_periodo_anterior";
