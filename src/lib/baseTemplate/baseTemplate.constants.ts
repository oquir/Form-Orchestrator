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
// Los demas calculados quedan afuera porque no hace falta: unos son sumas de no-negativos -- el
// impuesto de actividad, el total impuesto, el de avisos y tableros, el total a cargo -- y los
// renglones 33, 34 y 38 ya vienen recortados por su propio max(..., 0). El 35 hereda el recorte
// del 33, del que sale, y el 40 suma el 38 con un aporte voluntario que declara min: 0.
//
// La diferencia entre recortar aca y recortar en el script no es de estilo: el clamp avisa en
// pantalla que el calculo dio negativo y se recorto, y en el 38 eso saltaria cada vez que hay
// saldo a favor, que es un caso normal y no un error del autor.
export const CALCULATED_WITHOUT_NEGATIVE: string[] = [
  // r10 = ingresos nacionales - ingresos fuera del municipio.
  "total_ingresos_ordinarios",
  // r16 = el 10 menos las cinco deducciones. Es el caso tipico: deducciones mayores al ingreso.
  "total_ingresos_gravables",
];

// La declaracion no lleva decimales en ningun renglon: los de plata se aproximan al millar, el DV
// es un digito, los establecimientos se cuentan y los kilovatios vienen enteros.
export const TEMPLATE_DECIMALS: number = 0;

// La unica excepcion. Una tarifa puede ser 4, 7,5 o 6, y declarando un decimal la columna se lee
// pareja -- 4,0 / 7,5 / 6,0 -- en vez de saltar entre enteros y decimales.
export const DECIMALS_BY_FIELD: Record<string, number> = {
  tarifa_x_mil: 1,
};

// Los ids de EXTEMPORANEIDAD y OTRA dentro del catalogo tipos_sancion, escritos a mano porque el
// editor de condiciones todavia no ofrece las opciones de un catalogo para elegir. Son los unicos
// literales de la plantilla atados al contenido de un catalogo: si algun dia se reordena, esto se
// rompe en silencio.
export const TIPO_SANCION_EXTEMPORANEIDAD: string = "1";

export const TIPO_SANCION_OTRA: string = "4";

// La sancion por extemporaneidad del renglon 31, entera dentro del script del campo: los parametros
// del municipio, la eleccion de la base y la regla del articulo 641, en ese orden y en un solo
// lugar.
//
// Va aca y no repartida entre el prelude y el codigo, aunque el prelude tambien sea editable. El
// motivo no es tecnico sino de uso: un municipio pide cambiar el 5% por un 10%, o liquidar sobre
// otro renglon, y quien atiende ese pedido abre el renglon 31, ve la regla completa y la cambia.
// Repartida en dos pantallas hay que saber de antemano que la mitad esta en otro lado, y una regla
// que hay que ir a buscar es una regla que se termina reescribiendo mal.
//
// La plantilla la siembra como texto inicial; de ahi en mas vive en logic.script y es del autor del
// formulario. Nada de esto se recompila para cambiarlo.
//
// Lleva tildes a proposito, al reves que los comentarios del codigo: esto es contenido que se lee
// dentro del editor, igual que los rotulos de los campos.
export const SANCION_EXTEMPORANEIDAD_SCRIPT: string = `// --- Parámetros del municipio ---
// La ley fija estos valores como techo: un municipio solo puede bajarlos.

// UVT del año en que se liquida la sanción, no la del año gravable declarado.
// Se actualiza una vez por año.
const UVT = 52374;

// Sanción mínima, en UVT. El Estatuto Tributario pide 10; hay municipios
// que la dejan en 2, 3 o 5.
const MINIMA_UVT = 10;

// Cuánto crece por cada mes o fracción de mes de atraso. El ET pide 5%;
// hay municipios que aplican 10%, 1% u otro valor.
const POR_MES = 0.05;

// Tope de la sanción, como proporción de la base. El ET pide 100%.
const TOPE = 1;

// Sobre qué se liquida. El renglón 25 es el impuesto a cargo, que NO es el
// saldo a cargo del 33: ese ya restó retenciones y anticipos. Hay municipios
// que piden liquidarla sobre otro renglón; se cambia esta línea.
//
// Ojo con poner acá el 33, el 34, el 35 o el 38: todos incluyen a este mismo
// renglón en su cuenta, así que se armaría un cálculo circular.
const base = {total_impuesto_a_cargo};

// El período dentro del año. La declaración de ICA es anual, así que es 1.
const periodo = 1;

// --- Regla del artículo 641 ---

// Solo la extemporaneidad se autoliquida. Para los otros tipos devolvemos
// undefined, que significa "dejá lo que escriba el usuario": el campo no se
// marca como calculado y se sigue pudiendo teclear.
if ({tipo_sancion} !== "${TIPO_SANCION_EXTEMPORANEIDAD}") return undefined;

// Meses o fracción de atraso contra la tabla de la pestaña Fechas.
// Sin tabla cargada devuelve 0, y entonces no hay sanción.
const meses = mesesDeMora({periodo_anio}, periodo, {numero_documento});

// Sin atraso no hay sanción, y esta salida va antes que el mínimo: el mínimo
// es el piso de una sanción que existe, no crea una donde no la había.
if (meses <= 0) return 0;

return max(min(base * POR_MES * meses, base * TOPE), UVT * MINIMA_UVT);`;

// Lo que el contribuyente declara por actividad tiene que sumar lo mismo que el renglon 16. Si no,
// esta declarando ingresos que no reparte entre sus actividades, que es evadir el impuesto.
//
// Se compara con una tolerancia de un peso y no con === por la coma flotante. Hoy los dos lados se
// aproximan al millar y darian exactos, pero la regla no tiene por que depender de eso.
export const INGRESOS_ACTIVIDADES_SCRIPT: string =
  "return abs(sum({ingresos_gravados}) - {total_ingresos_gravables}) < 1;";

export const INGRESOS_ACTIVIDADES_MESSAGE: string =
  "La suma de los ingresos gravados de las actividades debe ser igual al renglón 16 (Total ingresos gravables).";

// El neto sin recortar, que comparten los renglones 33 y 34: uno lo toma en positivo y el otro
// en negativo. Va como expresion suelta -- sin return -- porque se interpola dentro de max(...).
export const SALDO_NETO: string =
  "{total_impuesto_a_cargo} - {valor_exencion_exoneracion_impuesto} - {retenciones_a_favor} - {autorretenciones_a_favor} - {anticipo_liquidado_anio_anterior} + {anticipo_anio_siguiente} + {valor_sancion} - {saldo_favor_periodo_anterior}";
