import { CONCEPTS_PAYLOAD_KEY } from "../../constants/fieldConcept";
import type { ExportedField } from "../../types/exportForm";
import type { ConceptoPayload } from "../../types/fieldConcept";
import type { RuntimeModel, RuntimeSnapshot } from "../../types/formRuntime";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { ARRAY_MARKER, conceptEntry, setDeepValue } from "./runtimePayload.utils";

// Arma el objeto que se le mandaria a la API a partir de lo que el usuario lleva escrito.
// Solo entra lo mapeado y visible: un campo oculto no viaja, aunque tenga valor de antes. Lo que va
// como concepto se junta en una lista aparte al final; ver conceptEntry.
export function buildPayload(
  model: RuntimeModel,
  snapshot: RuntimeSnapshot,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const conceptos: ConceptoPayload[] = [];

  for (const field of model.rootFields) {
    if (!snapshot.root.visible[field.name]) continue;

    const path: string | null = mappedPath(field);
    if (path !== null) {
      setDeepValue(payload, path, snapshot.root.values[field.name]);
      continue;
    }

    const concepto: ConceptoPayload | null = conceptEntry(field, snapshot.root.values[field.name]);
    if (concepto !== null) conceptos.push(concepto);
  }

  // Un concepto dentro de un grupo no se recorre: el builder no deja ponerlo ahi, y la lista plana
  // no sabria a que repeticion pertenece cada valor.
  for (const [groupId, fields] of model.groupFields) {
    (snapshot.groups[groupId] ?? []).forEach((scope, index) => {
      for (const field of fields) {
        const path: string | null = mappedPath(field);
        if (path === null || !scope.visible[field.name]) continue;

        // El "[]" de la ruta del grupo se cambia por la posicion real de la repeticion.
        setDeepValue(payload, path.replace(ARRAY_MARKER, `[${index}]`), scope.values[field.name]);
      }
    });
  }

  // La clave sale solo si el formulario declara conceptos: uno que no los usa, como la plantilla
  // ICA, manda exactamente el mismo objeto de antes.
  if (conceptFieldCount(model) > 0) payload[CONCEPTS_PAYLOAD_KEY] = conceptos;

  return payload;
}

export function mappedFieldCount(model: RuntimeModel): number {
  const groupFields: ExportedField[] = [...model.groupFields.values()].flat();

  return [...model.rootFields, ...groupFields].filter((field) => mappedPath(field) !== null).length;
}

export function conceptFieldCount(model: RuntimeModel): number {
  return model.rootFields.filter((field) => field.apiBinding?.kind === "concept").length;
}

function mappedPath(field: ExportedField): string | null {
  if (isPresentationalField(field.type)) return null;
  if (field.apiBinding?.kind !== "mapped") return null;

  return field.apiBinding.path;
}
