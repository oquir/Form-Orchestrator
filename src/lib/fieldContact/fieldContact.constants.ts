import type { PatternRule, PhoneKind } from "../../types/fieldContact";

// Desde septiembre de 2021 todo numero colombiano tiene 10 digitos, y lo que separa un celular de
// un fijo es como arranca. El \1 se escribe \\1 y los digitos van como [0-9] por lo mismo que en
// los patrones de documento de la plantilla: la regex viaja dentro de un string que el consumidor
// ejecuta con new Function, y donde se puede evitar una barra invertida, se evita.
//
// Celular: empieza por 3. El lookahead descarta los diez digitos iguales -- 3333333333 --, que es
// el de mentira que se escribe para pasar de pantalla.
const CELULAR_PATTERN: string = "^(?!([0-9])\\1+$)3[0-9]{9}$";

// Fijo: 60 mas el indicativo de la region y los 7 digitos de siempre (601 Bogota, 604 Antioquia...).
// El 603 no esta asignado, pero el patron no hace de guia de indicativos: rechazar uno valido por
// error seria peor que dejar pasar uno que no existe.
const FIJO_PATTERN: string = "^60[1-8][0-9]{7}$";

// Fax: un celular o un fijo, y al final una extension opcional. No hay norma colombiana para su
// largo; los conmutadores usan de 3 a 5 digitos y 6 cubre los grandes sin dejar pasar un segundo
// numero entero. Si un municipio pide otra cosa, una expresion propia en Validaciones la reemplaza.
export const MAX_EXTENSION_DIGITS: number = 6;

// La extension se escribe con "ext", "ext." o "x", en mayuscula o minuscula y con o sin espacios:
// 6011234567 ext 123, 6011234567 Ext. 123, 3001234567x45. Las mayusculas van como clases porque el
// consumidor arma el RegExp sin banderas, asi que no hay `i`. El celular se repite sin sus anclas:
// el lookahead mira solo los 10 digitos del numero, no la extension.
const EXTENSION_PATTERN: string = `(?:\\s*(?:[eE][xX][tT]\\.?|[xX])\\s*[0-9]{1,${MAX_EXTENSION_DIGITS}})?`;

const FAX_PATTERN: string = `^(?:(?!([0-9])\\1{9})3[0-9]{9}|60[1-8][0-9]{7})${EXTENSION_PATTERN}$`;

// El mensaje dice la regla y no solo que algo esta mal: los fijos de 7 digitos se siguen
// escribiendo, y "invalido" a secas no explica que ahora llevan el 60X adelante.
export const PHONE_FORMATS: Record<PhoneKind, PatternRule> = {
  celular: {
    pattern: CELULAR_PATTERN,
    message: "Ingrese un celular válido: 10 dígitos que empiezan por 3",
  },
  fijo: {
    pattern: FIJO_PATTERN,
    message: "Ingrese un fijo válido: 10 dígitos que empiezan por 60, como 6011234567",
  },
  fax: {
    pattern: FAX_PATTERN,
    message: `Ingrese un celular o fijo de 10 dígitos y, si tiene extensión, agréguela al final con "ext" (hasta ${MAX_EXTENSION_DIGITS} dígitos), como 6011234567 ext 123`,
  },
};

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

const CORREO_PATTERN: string = `^${CORREO_LOCAL}+(?:\\.${CORREO_LOCAL}+)*@(?:${CORREO_ETIQUETA}\\.)+${CORREO_ETIQUETA}$`;

export const EMAIL_FORMAT: PatternRule = {
  pattern: CORREO_PATTERN,
  message: "Ingrese un correo válido",
};
