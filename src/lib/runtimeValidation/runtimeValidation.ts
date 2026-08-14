import type { z } from "zod";
import type {
  ExportedField,
  ExportedGroupCheck,
  ExportedRepeatableGroup,
} from "../../types/exportForm";
import type {
  RuntimeIssue,
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
  ValidationResult,
} from "../../types/formRuntime";
import type { GroupCheckResult } from "../../types/groupCheck";
import type { ScriptRunResult } from "../../types/scriptRuntime";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { groupColumns } from "../formRuntime/formRuntime.utils";
import { coerceValues, runFieldScript } from "../scriptRuntime/scriptRuntime";
import { firstZodMessage, hydrateFieldSchemas } from "../zodHydrate/zodHydrate";
import { checkKey, coerceValue, effectiveSchemaSource, fieldKey } from "./runtimeValidation.utils";

// Valida todo el formulario contra los schemas de Zod hidratados desde el export.
// Devuelve dos cosas distintas: `errors` es lo que el usuario hizo mal llenando el formulario,
// `issues` es lo que esta mal en el formulario en si (un schema que no compila, un ciclo).
export function validateRuntime(model: RuntimeModel, snapshot: RuntimeSnapshot): ValidationResult {
  const groupFields: ExportedField[] = [...model.groupFields.values()].flat();
  const { schemas, issues } = hydrateFieldSchemas([...model.rootFields, ...groupFields]);
  const errors: Record<string, string> = {};

  collectErrors(model.rootFields, snapshot.root, schemas, errors);

  for (const [groupId, fields] of model.groupFields) {
    (snapshot.groups[groupId] ?? []).forEach((scope, index) => {
      collectErrors(fields, scope, schemas, errors, groupId, index);
    });
  }

  const checkIssues: RuntimeIssue[] = collectCheckErrors(model, snapshot, errors);

  return {
    errors,
    issues: [...issues, ...snapshot.issues, ...cycleIssues(snapshot), ...checkIssues],
  };
}

// El ambito en el que corre una comprobacion: el root con las columnas del grupo aplanadas a
// arrays, que es lo que hace que sum({ingresos_gravados}) tenga algo que sumar.
//
// Las columnas se arman desde snapshot.groups y no desde snapshot.root.values, que ya trae unas.
// No son las mismas: resolveRuntime mete en el root las de la PRIMERA pasada, y las definitivas son
// las de la tercera. Para una columna que el usuario teclea da igual, pero sumar una calculada por
// la copia vieja daria un numero distinto al que se ve en pantalla.
function buildCheckScope(
  model: RuntimeModel,
  root: RuntimeValues,
  groups: Record<string, RuntimeScope[]>,
): RuntimeValues {
  const values: Record<string, RuntimeValues[]> = {};

  for (const [groupId, scopes] of Object.entries(groups)) {
    values[groupId] = scopes.map((scope) => scope.values);
  }

  return coerceValues({ ...root, ...groupColumns(model, values) }, model);
}

// Falso reprueba, verdadero pasa. Los dos casos raros -- que el script reviente o que no devuelva
// nada -- se tratan igual y a proposito: son un error del formulario, no del contribuyente, asi que
// se reportan como issue y dejan pasar. Bloquear a alguien por un bug del autor lo deja encerrado
// en el paso sin nada que pueda corregir.
function runGroupCheck(
  check: ExportedGroupCheck,
  prelude: string,
  values: RuntimeValues,
): GroupCheckResult {
  const run: ScriptRunResult = runFieldScript(check.script.compiled, prelude, values, undefined, 0);

  if (run.error) return { failed: false, error: run.error };
  if (run.value === undefined) {
    return { failed: false, error: "La comprobación no devolvió ningún valor." };
  }

  return { failed: !run.value, error: null };
}

// Las comprobaciones de grupo van aparte del recorrido de campos porque no miran un valor: comparan
// la columna entera contra el resto del formulario, asi que necesitan un solo ambito comun y no uno
// por repeticion. El ambito se arma una vez para todas: montarlo aplana cada columna del grupo.
function collectCheckErrors(
  model: RuntimeModel,
  snapshot: RuntimeSnapshot,
  errors: Record<string, string>,
): RuntimeIssue[] {
  const groups: ExportedRepeatableGroup[] = [...model.groupsById.values()].filter(
    (group) => (group.checks?.length ?? 0) > 0,
  );
  if (groups.length === 0) return [];

  const values: RuntimeValues = buildCheckScope(model, snapshot.root.values, snapshot.groups);
  const issues: RuntimeIssue[] = [];

  for (const group of groups) {
    // Lo que llega en el export ya viene filtrado: una comprobacion apagada no se exporta.
    for (const check of group.checks ?? []) {
      const result: GroupCheckResult = runGroupCheck(check, model.prelude, values);

      if (result.error) {
        issues.push({
          kind: "script",
          field: check.label || group.title,
          message: `La comprobación «${check.label || group.title}» no se pudo evaluar: ${result.error}`,
        });
        continue;
      }

      if (result.failed) errors[checkKey(group.groupId, check.id)] = check.message;
    }
  }

  return issues;
}

function collectErrors(
  fields: ExportedField[],
  scope: RuntimeScope,
  schemas: Map<string, z.ZodType>,
  errors: Record<string, string>,
  groupId?: string,
  index?: number,
): void {
  for (const field of fields) {
    // Un campo presentacional no tiene valor que validar, y el export ni siquiera le pone schema.
    if (isPresentationalField(field.type)) continue;
    // Un campo oculto no se renderiza ni se valida: es la precedencia del contrato.
    if (!scope.visible[field.name]) continue;

    // El schema se elige con los valores del scope, no con el nombre del campo: uno con variantes
    // condicionales valida distinto segun lo que haya en el campo que observa.
    const source: string | undefined = effectiveSchemaSource(field, scope.values);
    if (source === undefined) continue;

    const schema: z.ZodType | undefined = schemas.get(source);
    if (!schema) continue;

    const result = schema.safeParse(coerceValue(field, scope.values[field.name]));
    if (!result.success) {
      errors[fieldKey(field.name, groupId, index)] = firstZodMessage(result.error);
    }
  }
}

function cycleIssues(snapshot: RuntimeSnapshot): RuntimeIssue[] {
  if (!snapshot.cycle) return [];

  return [
    {
      kind: "cycle",
      message: `Dependencia circular entre: ${snapshot.cycle.join(", ")}. Esos campos no se calculan.`,
    },
  ];
}
