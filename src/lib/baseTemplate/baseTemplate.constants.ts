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

// El patron de correo de la spec de HTML5, partido en sus dos mitades para poder leerlo. Lleva dos
// cambios respecto del original:
//   - Va anclado con ^ y $. Zod valida con .test(), que busca en cualquier parte del texto: sin
//     anclas "hola juan@x.com chau" pasaria como correo valido.
//   - Las clases incluyen A-Z. El original es solo minusculas y aca no hay forma de agregar la
//     bandera `i`, porque el consumidor arma el RegExp con new RegExp(patron) y sin banderas;
//     sin esto "Juan@Gmail.com" quedaria rechazado.
// La bandera /g del original tampoco viaja, y es mejor asi: un regex con /g guarda lastIndex entre
// llamadas y con .test() daria valido y no valido alternadamente sobre el mismo texto.
const CORREO_LOCAL: string = "[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]";

const CORREO_ETIQUETA: string = "[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?";

export const CORREO_PATTERN: string = `^${CORREO_LOCAL}+(?:\\.${CORREO_LOCAL}+)*@(?:${CORREO_ETIQUETA}\\.)+${CORREO_ETIQUETA}$`;

export const DOCUMENTO_MESSAGE: string = "Ingrese un documento válido";

export const CORREO_MESSAGE: string = "Ingrese un correo válido";

export const TELEFONO_MESSAGE: string = "Ingrese un teléfono válido";

// El mensaje cuelga del .regex(), y la variante de NIT tiene un solo regex: este texto sale igual
// si escribieron diez digitos, letras o todos iguales. Por eso nombra el DV sin afirmar que ese
// fue el error -- "sin el digito de verificacion" es una instruccion, no un diagnostico.
export const NIT_MESSAGE: string = "Ingrese un NIT válido, sin el dígito de verificación";

// Los campos numericos de la declaracion que NO llevan plata. Todo renglon de valor se aproxima
// al millar, asi que lo que se escribe a mano son las excepciones y no los treinta y pico que si
// redondean: un renglon nuevo entra redondeando, que es lo correcto por defecto, y el que no
// deberia hacerlo se agrega aca.
export const FIELDS_WITHOUT_ROUNDING: string[] = [
  // Una tarifa del 4 por mil aproximada al millar es 0, y con ella todo impuesto de actividad.
  "tarifa_x_mil",
  // El digito de verificacion va de 0 a 9.
  "dv",
  // Un conteo de establecimientos, no un valor.
  "numero_establecimientos",
  // Es un renglon numerado -- el 18 -- pero lo que lleva son kilovatios de capacidad instalada y
  // no pesos, y la regla de aproximar al millar habla de valores.
  "generacion_energia_kw",
];

// Los unicos calculados que pueden dar negativo, y por eso los unicos que se recortan a 0. Los
// `number` se marcan todos sin lista: los veintiseis ya declaraban min: 0, salvo la tarifa, que
// tampoco es negativa nunca.
//
// Los otros ocho calculados quedan afuera porque no hace falta: seis son sumas de no-negativos
// -- el impuesto de actividad, el total impuesto, el de avisos y tableros, el total a cargo --
// y los renglones 33 y 34 ya vienen recortados por su propio max(..., 0).
export const CALCULATED_WITHOUT_NEGATIVE: string[] = [
  // r10 = ingresos nacionales - ingresos fuera del municipio.
  "total_ingresos_ordinarios",
  // r16 = el 10 menos las cinco deducciones. Es el caso tipico: deducciones mayores al ingreso.
  "total_ingresos_gravables",
  // r36 = el 35 menos el descuento por pronto pago mas los intereses de mora. Un total a pagar
  // negativo no existe en la declaracion: si pago de mas, eso es el saldo a favor del 34.
  "total_a_pagar",
  // r40 = el 36 mas el aporte voluntario, negativo solo si lo es el 36.
  "total_a_pagar_con_aporte_voluntario",
];

// El neto sin recortar, que comparten los renglones 33 y 34: uno lo toma en positivo y el otro
// en negativo. Va como expresion suelta -- sin return -- porque se interpola dentro de max(...).
export const SALDO_NETO: string =
  "{total_impuesto_a_cargo} - {valor_exencion_exoneracion_impuesto} - {retenciones_a_favor} - {autorretenciones_a_favor} - {anticipo_liquidado_anio_anterior} + {anticipo_anio_siguiente} + {valor_sancion} - {saldo_favor_periodo_anterior}";
