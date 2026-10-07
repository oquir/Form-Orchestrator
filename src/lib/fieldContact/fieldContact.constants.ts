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
