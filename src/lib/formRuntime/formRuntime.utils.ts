import type { ExportedField, ExportedStep } from "../../types/exportForm";
import type {
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
} from "../../types/formRuntime";
import { evaluateCondition } from "../runtimeCondition/runtimeCondition";
import { fieldKey } from "../runtimeValidation/runtimeValidation.utils";

// Piezas de apoyo del runtime: recorridos del export y armado de los ambitos.

export function stepFields(step: ExportedStep): ExportedField[] {
  return step.rows.flatMap((row) => row.fields);
}

// Las claves de error de un paso: los campos sueltos por nombre y los de un grupo repetible
// una vez por repeticion, que es como las indexa validateRuntime.
export function stepErrorKeys(step: ExportedStep, snapshot: RuntimeSnapshot): string[] {
  const keys: string[] = [];

  for (const row of step.rows) {
    for (const field of row.fields) {
      if (!row.groupId) {
        keys.push(field.name);
        continue;
      }

      const repetitions: number = (snapshot.groups[row.groupId] ?? []).length;
      for (let index = 0; index < repetitions; index += 1) {
        keys.push(fieldKey(field.name, row.groupId, index));
      }
    }
  }

  return keys;
}

export function allSteps(model: RuntimeModel): ExportedStep[] {
  return [...model.introSteps, ...model.steps];
}

// Convierte cada columna de un grupo en un array bajo el nombre del campo. Es lo que permite que
// sumOf(impuesto_actividad) encuentre algo que sumar cuando se resuelve el root.
export function groupColumns(
  model: RuntimeModel,
  groups: Record<string, RuntimeValues[]>,
): RuntimeValues {
  const columns: RuntimeValues = {};

  for (const [groupId, fields] of model.groupFields) {
    const items: RuntimeValues[] = groups[groupId] ?? [];

    for (const field of fields) {
      columns[field.name] = items.map((item) => item[field.name]);
    }
  }

  return columns;
}

export function buildScope(
  fields: ExportedField[],
  values: RuntimeValues,
  computed: Record<string, boolean>,
): RuntimeScope {
  const visible: Record<string, boolean> = {};
  const disabled: Record<string, boolean> = {};

  // Precedencia del contrato: alwaysDisabled gana sobre enableWhen. La visibilidad se calcula
  // aparte porque manda sobre las dos: un campo oculto no se dibuja ni se valida.
  for (const field of fields) {
    visible[field.name] = evaluateCondition(field.visibleWhen, values);
    disabled[field.name] =
      Boolean(field.alwaysDisabled) || !evaluateCondition(field.enableWhen, values);
  }

  return { values, visible, disabled, computed };
}

export function emptyItem(fields: ExportedField[]): RuntimeValues {
  const item: RuntimeValues = {};

  for (const field of fields) item[field.name] = undefined;

  return item;
}
