import { CONCEPT_ID_MAX, CONCEPT_KIND_BY_FIELD_TYPE } from "../../constants/fieldConcept";
import type { CanvasField } from "../../types/field";
import type { ConceptValueKind } from "../../types/fieldConcept";

// Los conceptos tributarios: un tercer destino para el valor de un campo, ademas de una hoja del
// contrato o ninguna parte. Lo que el contrato fijo no contempla viaja en la lista `conceptos` del
// payload, identificado por el id de la tabla de conceptos del backend. Sin React ni store.
//
// El tipo de dato no se guarda en el binding: sale del tipo del campo cada vez que se pregunta,
// igual que hasLinkedLabel se deduce y no se guarda. Guardado podria quedar viejo.

export function conceptKindOf(fieldType: string): ConceptValueKind | null {
  return CONCEPT_KIND_BY_FIELD_TYPE[fieldType] ?? null;
}

export function isValidConceptId(id: number | undefined): id is number {
  return id !== undefined && Number.isInteger(id) && id > 0 && id <= CONCEPT_ID_MAX;
}

// Solo digitos: un id nunca lleva signo, punto ni exponente. Lo que no sirve se guarda como
// ausente, que la revision de exportacion ya sabe reportar.
export function parseConceptId(raw: string): number | undefined {
  const trimmed: string = raw.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;

  const id: number = Number(trimmed);
  return isValidConceptId(id) ? id : undefined;
}

// Los campos que se envian como concepto, agrupados por id. Dos en la misma lista se pisarian del
// otro lado, que guarda una fila por concepto y declaracion. Un campo sin id valido no entra: ese
// problema es otro y se reporta aparte.
export function conceptOwners(fields: CanvasField[]): Map<number, CanvasField[]> {
  const owners: Map<number, CanvasField[]> = new Map();

  for (const field of fields) {
    const binding = field.apiBinding;
    if (binding?.kind !== "concept" || conceptKindOf(field.type) === null) continue;
    if (!isValidConceptId(binding.idConcepto)) continue;

    owners.set(binding.idConcepto, [...(owners.get(binding.idConcepto) ?? []), field]);
  }

  return owners;
}
