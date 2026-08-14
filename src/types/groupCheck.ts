// Una comprobacion que abarca al grupo repetible entero. No es una validacion de campo mas: esas
// miran un valor por vez -- safeParse sobre un escalar -- y no pueden comparar la columna de un
// grupo contra un campo de afuera. Zod tampoco llega, porque el schema del array no ve el root.
//
// El dueno es el grupo y no el campo raiz con el que se compara, por dos razones. La primera es
// que en el paso de las actividades no hay ningun campo suelto del que colgar el error. La
// segunda pesa mas: la validacion es por pantalla y bloquea el avance, asi que colgarla del
// renglon 16 -- que vive un paso antes -- frenaria al contribuyente antes de que exista una sola
// actividad que corregir.
export interface GroupCheck {
  id: string;
  // Como se llama la comprobacion en el panel y en la lista de errores. No es el mensaje.
  label: string;
  // Apagada no viaja en el export: el consumidor no se entera de que existio. Existe porque hay
  // municipios que prefieren dejar pasar el error y cobrar la multa despues.
  enabled: boolean;
  // Script con {campo}, evaluado en el ambito raiz, donde la columna del grupo es el array entero
  // y `sum` lo aplana. Verdadero pasa, falso falla.
  script: string;
  message: string;
}

// `failed` es lo que el contribuyente hizo mal; `error` es lo que esta mal en la comprobacion en
// si. Nunca son las dos: una comprobacion rota no reprueba a nadie.
export interface GroupCheckResult {
  failed: boolean;
  error: string | null;
}
