import type {
  ExportedField,
  ExportedRepeatableGroup,
  ExportedStep,
  FormExport,
} from "../../types/exportForm";
import type {
  PreviewState,
  RuntimeModel,
  RuntimeScope,
  RuntimeSnapshot,
  RuntimeValues,
} from "../../types/formRuntime";
import { computeDerivedValues, type DerivedResult } from "../runtimeFormula/runtimeFormula";
import { buildScope, emptyItem, groupColumns } from "./formRuntime.utils";

export function buildRuntimeModel(exported: FormExport): RuntimeModel {
  const steps: ExportedStep[] = exported.formSchema.steps;
  const introSteps: ExportedStep[] = exported.setupConfig.introModal?.steps ?? [];
  const fieldsByName: Map<string, ExportedField> = new Map();
  const groupsById: Map<string, ExportedRepeatableGroup> = new Map();
  const groupIdByFieldName: Map<string, string> = new Map();
  const groupFields: Map<string, ExportedField[]> = new Map();
  const externalLabels: Map<string, string> = new Map();
  const rootFields: ExportedField[] = [];

  for (const step of [...introSteps, ...steps]) {
    for (const group of step.groups ?? []) {
      groupsById.set(group.groupId, group);
      if (!groupFields.has(group.groupId)) groupFields.set(group.groupId, []);
    }

    for (const row of step.rows) {
      for (const field of row.fields) {
        fieldsByName.set(field.name, field);
        if (field.labelFor) externalLabels.set(field.labelFor, field.label);

        if (row.groupId) {
          groupIdByFieldName.set(field.name, row.groupId);
          groupFields.set(row.groupId, [...(groupFields.get(row.groupId) ?? []), field]);
          continue;
        }

        rootFields.push(field);
      }
    }
  }

  return {
    steps,
    introSteps,
    hasIntroModal: exported.setupConfig.hasIntroModal && introSteps.length > 0,
    gridBaseColumns: exported.formSchema.gridBaseColumns,
    fieldsByName,
    groupsById,
    groupIdByFieldName,
    rootFields,
    groupFields,
    externalLabels,
  };
}

export function createInitialState(model: RuntimeModel): PreviewState {
  const groups: Record<string, RuntimeValues[]> = {};

  for (const [groupId, fields] of model.groupFields) {
    const min: number = model.groupsById.get(groupId)?.min ?? 1;
    const count: number = Math.max(1, min);
    groups[groupId] = Array.from({ length: count }, () => emptyItem(fields));
  }

  return { values: {}, groups };
}

export function resolveRuntime(model: RuntimeModel, state: PreviewState): RuntimeSnapshot {
  // Pasada 1: los grupos con los valores crudos del root, para poder alimentar los agregados.
  const firstPass: Record<string, RuntimeValues[]> = resolveGroupValues(model, state, state.values);

  // Pasada 2: el root ya ve las columnas del grupo como arrays (sumOf/countOf).
  const rootBase: RuntimeValues = { ...state.values, ...groupColumns(model, firstPass) };
  const rootDerived: DerivedResult = computeDerivedValues(model.rootFields, rootBase);

  // Pasada 3: los grupos se recalculan con el root ya resuelto.
  const finalGroups: Record<string, RuntimeValues[]> = resolveGroupValues(
    model,
    state,
    rootDerived.values,
  );

  const groups: Record<string, RuntimeScope[]> = {};
  const cycles: string[] = [...(rootDerived.cycle ?? [])];

  for (const [groupId, fields] of model.groupFields) {
    groups[groupId] = (state.groups[groupId] ?? []).map((_, index) => {
      const base: RuntimeValues = {
        ...rootDerived.values,
        ...(finalGroups[groupId]?.[index] ?? {}),
      };
      const derived: DerivedResult = computeDerivedValues(fields, base);
      if (derived.cycle) cycles.push(...derived.cycle);

      return buildScope(fields, derived.values, derived.computed);
    });
  }

  return {
    root: buildScope(model.rootFields, rootDerived.values, rootDerived.computed),
    groups,
    cycle: cycles.length > 0 ? [...new Set(cycles)] : null,
  };
}

function resolveGroupValues(
  model: RuntimeModel,
  state: PreviewState,
  rootValues: RuntimeValues,
): Record<string, RuntimeValues[]> {
  const resolved: Record<string, RuntimeValues[]> = {};

  for (const [groupId, fields] of model.groupFields) {
    resolved[groupId] = (state.groups[groupId] ?? []).map((item) => {
      const derived: DerivedResult = computeDerivedValues(fields, { ...rootValues, ...item });
      const scoped: RuntimeValues = {};

      for (const field of fields) scoped[field.name] = derived.values[field.name];

      return scoped;
    });
  }

  return resolved;
}
