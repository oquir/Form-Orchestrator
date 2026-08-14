import type {
  ExportedCondition,
  ExportedGroupCheck,
  ExportedRepeatableGroup,
  ExportedRow,
  ExportedRule,
  ExportedScript,
  ExportedStep,
  ExportedValidations,
  ExportedValidationVariant,
} from "../../types/exportForm";
import type { CanvasField, CatalogFill, FieldCondition, FieldDataSource } from "../../types/field";
import type { CanvasRow, FormStep, RepeatableGroup } from "../../types/formStructure";
import { operatorTakesList, parseConditionList } from "../fieldCondition/fieldCondition";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { exportableOptions } from "../fieldOptions/fieldOptions";
import { exportableDecimals, exportableRounding } from "../fieldRounding/fieldRounding";
import { compileScript } from "../fieldScript/fieldScript";
import { exportableAllowsNegative } from "../fieldSign/fieldSign";
import { exportableTooltip } from "../fieldTooltip/fieldTooltip";
import { enabledChecks } from "../groupCheck/groupCheck";
import { exportableFormatting } from "../numberFormat/numberFormat";
import { groupFields } from "../repeatableGroup/repeatableGroup";
import {
  buildGroupZodSchema,
  buildOverrideZodSchema,
  buildZodSchema,
} from "../zodSchema/zodSchema";

// Traduccion del modelo interno al contrato de salida. La regla que gobierna todo el archivo:
// hacia afuera no viaja ningun uuid, cada referencia a un campo se convierte en su nombre.

export function buildNameIndex(rows: CanvasRow[]): Map<string, string> {
  const index: Map<string, string> = new Map();

  for (const row of rows) {
    for (const field of row.fields) {
      index.set(field.id, field.name);
    }
  }

  return index;
}

export function resolveCondition(
  condition: FieldCondition | undefined,
  names: Map<string, string>,
): ExportedCondition | undefined {
  if (!condition) return undefined;

  // Los operadores de lista guardan el valor como texto separado por comas mientras se edita;
  // al salir se entrega ya partido en array para que el consumidor no tenga que interpretarlo.
  return {
    field: names.get(condition.fieldId) ?? condition.fieldId,
    operator: condition.operator,
    value: operatorTakesList(condition.operator)
      ? parseConditionList(condition.value)
      : condition.value,
  };
}

// Un override cuya condicion apunta a un campo que ya no existe se descarta entero, igual que
// resolveCondition hace con visibleWhen: exportar una variante que nunca se puede evaluar seria
// darle al consumidor una regla muerta que igual tiene que recorrer.
export function resolveValidations(
  field: CanvasField,
  names: Map<string, string>,
): ExportedValidations {
  if (isPresentationalField(field.type)) return {};

  const variants: ExportedValidationVariant[] = (field.validations.overrides ?? []).flatMap(
    (override) => {
      const when: ExportedCondition | undefined = resolveCondition(override.when, names);
      if (!when || !names.has(override.when.fieldId)) return [];

      return [{ when, zodSchema: buildOverrideZodSchema(field, override) }];
    },
  );

  return {
    zodSchema: buildZodSchema(field),
    ...(variants.length > 0 ? { zodSchemaWhen: variants } : {}),
  };
}

// El script se compila aca y no del lado del consumidor: {campo} no es JS, y hacer que cada
// consumidor implemente el recorrido que distingue codigo de texto seria repartir la parte
// delicada. Sale ya en JS, con las dependencias que declara al leerlas.
function compileSource(source: string, knownNames: Set<string>): ExportedScript {
  const { code, reads } = compileScript(source, knownNames);

  return { source, compiled: code, reads };
}

export function resolveScript(
  field: CanvasField,
  knownNames: Set<string>,
): ExportedScript | undefined {
  // Un campo presentacional no tiene valor que calcular, igual que no tiene validaciones.
  if (isPresentationalField(field.type)) return undefined;

  const source: string = field.logic.script ?? "";
  if (source.trim().length === 0) return undefined;

  return compileSource(source, knownNames);
}

export function resolveRules(
  field: CanvasField,
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedRule[] | undefined {
  if (!field.logic.rules || field.logic.rules.length === 0) return undefined;

  return field.logic.rules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    matchAll: rule.matchAll,
    when: rule.when.map((condition) => ({
      field: names.get(condition.fieldId) ?? condition.fieldId,
      operator: condition.operator,
      value: operatorTakesList(condition.operator)
        ? parseConditionList(condition.value)
        : condition.value,
    })),
    effects: rule.effects.map((effect) =>
      effect.kind === "constant"
        ? effect
        : {
            id: effect.id,
            kind: "script" as const,
            script: compileSource(effect.source, knownNames),
          },
    ),
  }));
}

export function resolveDataSource(
  field: CanvasField,
  names: Map<string, string>,
): FieldDataSource | undefined {
  const source: FieldDataSource | undefined = field.dataSource;
  if (!source) return undefined;

  // Un relleno cuyo destino ya no existe se descarta entero, igual que un override que apunta a
  // un campo borrado: dejarlo seria mandarle al consumidor una instruccion de copiar a la nada.
  const fills: CatalogFill[] | undefined = source.fills?.flatMap((fill) => {
    const name: string | undefined = names.get(fill.field);

    return name ? [{ column: fill.column, field: name }] : [];
  });

  return {
    catalog: source.catalog,
    dependsOn: source.dependsOn ? (names.get(source.dependsOn) ?? source.dependsOn) : undefined,
    fills: fills && fills.length > 0 ? fills : undefined,
  };
}

export function mapRows(
  rows: CanvasRow[],
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedRow[] {
  return rows.map((row) => ({
    rowId: row.id,
    columns: row.columns,
    groupId: row.groupId,
    fields: row.fields.map((field) => ({
      fieldId: field.id,
      name: field.name,
      type: field.type,
      label: field.label,
      colStart: field.colStart,
      colSpan: field.colSpan,
      styles: field.styles,
      // Solo se exporta el schema como texto, nunca las validaciones sueltas: que no haya schema
      // es justamente como el consumidor sabe que un campo presentacional no valida nada.
      validations: resolveValidations(field, names),
      logic: {
        script: resolveScript(field, knownNames),
        rules: resolveRules(field, names, knownNames),
      },
      title: field.title,
      options: exportableOptions(field),
      fileConfig: field.fileConfig,
      alwaysDisabled: field.alwaysDisabled,
      enableWhen: resolveCondition(field.enableWhen, names),
      visibleWhen: resolveCondition(field.visibleWhen, names),
      apiBinding: field.apiBinding,
      dataSource: resolveDataSource(field, names),
      labelFor: field.labelFor ? (names.get(field.labelFor) ?? field.labelFor) : undefined,
      content: field.content,
      tooltip: exportableTooltip(field),
      rounding: exportableRounding(field),
      formatted: exportableFormatting(field),
      allowsNegative: exportableAllowsNegative(field),
      decimals: exportableDecimals(field),
    })),
  }));
}

// Solo salen las encendidas, y sin bandera: apagar una comprobacion la borra del contrato en vez
// de mandarla desactivada. El consumidor no tiene que saber que existio ni decidir que hacer con
// ella, que es la misma regla por la que un tooltip vacio no deja rastro en el JSON.
function resolveChecks(
  group: RepeatableGroup,
  knownNames: Set<string>,
): ExportedGroupCheck[] | undefined {
  const checks: ExportedGroupCheck[] = enabledChecks(group.checks).map((check) => ({
    id: check.id,
    label: check.label,
    script: compileSource(check.script, knownNames),
    message: check.message,
  }));

  return checks.length > 0 ? checks : undefined;
}

export function mapGroups(
  step: FormStep,
  knownNames: Set<string>,
): ExportedRepeatableGroup[] | undefined {
  if (!step.groups || step.groups.length === 0) return undefined;

  return step.groups.map((group) => ({
    groupId: group.id,
    name: group.name,
    title: group.title,
    min: group.min,
    max: group.max,
    arrayPath: group.arrayPath,
    zodSchema: buildGroupZodSchema(group, groupFields(step.rows, group.id)),
    checks: resolveChecks(group, knownNames),
  }));
}

export function mapFormStep(
  step: FormStep,
  names: Map<string, string>,
  knownNames: Set<string>,
): ExportedStep {
  return {
    stepId: step.stepId,
    title: step.title,
    subtitle: step.subtitle || undefined,
    rows: mapRows(step.rows, names, knownNames),
    groups: mapGroups(step, knownNames),
  };
}
