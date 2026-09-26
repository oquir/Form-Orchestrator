import type { ExportedField } from "../../types/exportForm";
import type { ConceptoPayload } from "../../types/fieldConcept";
import { isValidConceptId } from "../fieldConcept/fieldConcept";

// Escritura por ruta sobre el objeto del payload. Las rutas del contrato vienen como
// "contribuyente.primerNombre" o "actividades[0].idActividad", y hay que crear los tramos que
// falten sobre la marcha porque el objeto empieza vacio.

export const ARRAY_MARKER = "[]";

interface PathSegment {
  key: string;
  index: number | null;
}

export function parsePath(path: string): PathSegment[] {
  return path
    .split(".")
    .filter((part) => part.length > 0)
    .map((part) => {
      const match: RegExpMatchArray | null = part.match(/^(.*?)\[(\d+)\]$/);

      return match
        ? { key: match[1], index: Number.parseInt(match[2], 10) }
        : { key: part, index: null };
    });
}

export function setDeepValue(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments: PathSegment[] = parsePath(path);
  if (segments.length === 0) return;

  let cursor: Record<string, unknown> = target;

  segments.forEach((segment, position) => {
    const isLast: boolean = position === segments.length - 1;

    if (segment.index === null) {
      if (isLast) {
        cursor[segment.key] = value;
        return;
      }

      if (typeof cursor[segment.key] !== "object" || cursor[segment.key] === null) {
        cursor[segment.key] = {};
      }
      cursor = cursor[segment.key] as Record<string, unknown>;
      return;
    }

    // Se rellenan los huecos hasta el indice pedido: las repeticiones no llegan en orden y el
    // array no puede quedar disperso, o el consumidor recibiria posiciones vacias.
    if (!Array.isArray(cursor[segment.key])) cursor[segment.key] = [];
    const list = cursor[segment.key] as Record<string, unknown>[];
    while (list.length <= segment.index) list.push({});

    if (isLast) {
      list[segment.index] = value as Record<string, unknown>;
      return;
    }

    cursor = list[segment.index];
  });
}

// Un concepto con su valor ya convertido, o null si no hay nada que mandar. Son las reglas del
// contrato con el backend (CLAUDE.md, "Conceptos tributarios") y se leen solo del export, como las
// va a leer el consumidor: el tipo viene resuelto en el binding y las opciones en `options`.
// Un concepto sin respuesta no viaja, para no llenar filas vacias del otro lado.
export function conceptEntry(field: ExportedField, value: unknown): ConceptoPayload | null {
  const binding = field.apiBinding;
  if (binding?.kind !== "concept" || !isValidConceptId(binding.idConcepto)) return null;

  const idConcepto: number = binding.idConcepto;

  switch (binding.tipo) {
    case "texto": {
      const text: string = value === undefined || value === null ? "" : optionText(field, value);
      return text.trim() === "" ? null : { idConcepto, tipo: "texto", valorTexto: text };
    }
    case "numero":
      return typeof value === "number" && Number.isFinite(value)
        ? { idConcepto, tipo: "numero", valorNumero: value }
        : null;
    // Desmarcado tambien es una respuesta, asi que el checkbox viaja siempre.
    case "booleano":
      return { idConcepto, tipo: "booleano", valorBooleano: value === true };
    case "lista": {
      const items: string[] = Array.isArray(value)
        ? value.map((item: unknown) => optionText(field, item))
        : [];
      return items.length > 0 ? { idConcepto, tipo: "lista", valorLista: items } : null;
    }
    // El archivo no cabe en el JSON: aca va su nombre, y el binario viaja aparte por donde lo
    // acuerden el consumidor y el backend.
    case "archivo":
      return value instanceof File ? { idConcepto, tipo: "archivo", valorTexto: value.name } : null;
  }
}

// Las opciones escritas a mano tienen un uuid por id, que el backend no conoce: viaja el texto que
// vio el contribuyente. Las de un catalogo no salen en `options` -el export solo trae las manuales-
// y su id ya es el del backend, asi que van tal cual. Un campo sin opciones devuelve su texto.
function optionText(field: ExportedField, value: unknown): string {
  const id: string = String(value);

  return field.options?.find((option) => option.id === id)?.label ?? id;
}
