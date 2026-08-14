import type { ExportedField, ExportedStep } from "../../types/exportForm";
import type {
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
} from "../../types/formRuntime";
import { evaluateCondition } from "../runtimeCondition/runtimeCondition";
import { checkKey, fieldKey } from "../runtimeValidation/runtimeValidation.utils";

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

  // Las comprobaciones del grupo son del paso que lo declara, no de una fila suya. Sin esta vuelta
  // el error existiria en la lista pero "Siguiente" avanzaria igual, que es justo lo contrario de
  // lo que se pide de ella.
  for (const group of step.groups ?? []) {
    for (const check of group.checks ?? []) keys.push(checkKey(group.groupId, check.id));
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
  clamped: Record<string, boolean>,
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

  // Segunda pasada, y tiene que serlo: el destino puede aparecer despues que su etiqueta en la
  // lista, asi que su visibilidad todavia no estaria calculada.
  //
  // Una etiqueta enlazada se esconde con su campo. La regla no se puede dejar en manos del autor
  // -- copiar el visibleWhen del campo a la etiqueta -- porque dos condiciones que dicen lo mismo
  // se desincronizan a la primera edicion, y el resultado es un rotulo suelto apuntando a un campo
  // que no esta. Se deriva, igual que hasLinkedLabel.
  //
  // El === false es a proposito: si el destino no vive en este ambito no hay nada que heredar y la
  // etiqueta se queda como estaba.
  for (const field of fields) {
    if (field.labelFor && visible[field.labelFor] === false) visible[field.name] = false;
  }

  return { values, visible, disabled, computed, clamped };
}

export function emptyItem(fields: ExportedField[]): RuntimeValues {
  const item: RuntimeValues = {};

  for (const field of fields) item[field.name] = undefined;

  return item;
}
