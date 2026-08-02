import type { ExportedField } from "../../types/exportForm";
import type { RuntimeModel, RuntimeSnapshot } from "../../types/formRuntime";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { ARRAY_MARKER, setDeepValue } from "./runtimePayload.utils";

export function buildPayload(
  model: RuntimeModel,
  snapshot: RuntimeSnapshot,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of model.rootFields) {
    const path: string | null = mappedPath(field);
    if (path === null || !snapshot.root.visible[field.name]) continue;

    setDeepValue(payload, path, snapshot.root.values[field.name]);
  }

  for (const [groupId, fields] of model.groupFields) {
    (snapshot.groups[groupId] ?? []).forEach((scope, index) => {
      for (const field of fields) {
        const path: string | null = mappedPath(field);
        if (path === null || !scope.visible[field.name]) continue;

        setDeepValue(payload, path.replace(ARRAY_MARKER, `[${index}]`), scope.values[field.name]);
      }
    });
  }

  return payload;
}

export function mappedFieldCount(model: RuntimeModel): number {
  const groupFields: ExportedField[] = [...model.groupFields.values()].flat();

  return [...model.rootFields, ...groupFields].filter((field) => mappedPath(field) !== null).length;
}

function mappedPath(field: ExportedField): string | null {
  if (isPresentationalField(field.type)) return null;
  if (field.apiBinding?.kind !== "mapped") return null;

  return field.apiBinding.path;
}
