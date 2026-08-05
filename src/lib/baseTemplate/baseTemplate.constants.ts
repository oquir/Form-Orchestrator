export const TIPO_DOCUMENTO_NIT: string = "2";

// Solo digitos, entre 6 y 10, y ademas descarta los documentos de mentira que la gente escribe
// para pasar de pantalla. Tres piezas:
//   (?!0)            no arranca en cero: ningun documento colombiano lo hace, y de paso mata
//                    los 0000000 y los 0000001, que el chequeo de repetidos no alcanza.
//   (?!([0-9])\1+$)  no son todos el mismo digito: 1111111, 99999999, etc. La captura pide un
//                    digito y \1+ exige que lo que sigue hasta el final sea ese mismo.
//   [0-9]{6,10}      la longitud, dentro del patron y no en minLength/maxLength, para que un
//                    documento mal escrito de un unico mensaje en vez de tres.
// El \1 se escribe \\1 aca a proposito: el patron viaja al consumidor dentro de un string que
// este ejecuta con new Function, asi que la barra pasa por JSON.stringify y por el parser de JS
// antes de llegar al RegExp. Por eso mismo los digitos van como [0-9] y no como \d: donde se
// puede evitar una barra invertida, se evita.
export const DOCUMENTO_PATTERN: string = "^(?!0)(?!([0-9])\\1+$)[0-9]{6,10}$";

// Un NIT son 9 digitos: el decimo es el digito de verificacion, y ese va en su propio campo.
export const NIT_PATTERN: string = "^(?!0)(?!([0-9])\\1+$)[0-9]{6,9}$";

export const DOCUMENTO_MESSAGE: string = "Ingrese un documento válido";

export const SALDO_NETO: string =
  "total_impuesto_a_cargo - valor_exencion_exoneracion_impuesto - retenciones_a_favor - autorretenciones_a_favor - anticipo_liquidado_anio_anterior + anticipo_anio_siguiente + valor_sancion - saldo_favor_periodo_anterior";
