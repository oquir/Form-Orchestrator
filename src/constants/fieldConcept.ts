import type { ConceptValueKey, ConceptValueKind } from "../types/fieldConcept";

// La clave del payload donde va la lista. Queda fuera de PAYLOAD_SCHEMA a proposito: no es una
// hoja que se mapee sino una lista que arma el consumidor, y declarada ahi se ofreceria como
// arrayPath de un grupo repetible.
export const CONCEPTS_PAYLOAD_KEY = "conceptos";

// IdConcepto es un int en el backend. Un id mas grande no cabe y la API rechazaria la declaracion
// entera, asi que se corta aca.
export const CONCEPT_ID_MAX: number = 2_147_483_647;

// Que tipo de dato manda cada campo. Los de opciones mandan texto: el de la opcion si se escribio a
// mano, el id si viene de un catalogo (la regla vive en runtimePayload). Los presentacionales no
// estan porque no tienen valor que mandar.
export const CONCEPT_KIND_BY_FIELD_TYPE: Record<string, ConceptValueKind> = {
  text: "texto",
  textarea: "texto",
  number: "numero",
  calculated: "numero",
  checkbox: "booleano",
  select: "texto",
  search_select: "texto",
  toggle_group: "texto",
  radio_group: "texto",
  checkbox_group: "lista",
  file: "archivo",
};

// El archivo viaja por su nombre: el binario no cabe en el JSON y va aparte.
export const CONCEPT_VALUE_KEY: Record<ConceptValueKind, ConceptValueKey> = {
  texto: "valorTexto",
  numero: "valorNumero",
  booleano: "valorBooleano",
  lista: "valorLista",
  archivo: "valorTexto",
};
