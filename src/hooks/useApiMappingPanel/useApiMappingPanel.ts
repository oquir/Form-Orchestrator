import { useState } from "react";
import { PAYLOAD_SCHEMA } from "../../constants/payloadSchema";
import { isOptionBasedField } from "../../lib/fieldOptions/fieldOptions";
import { fieldMatchesLeaf } from "../../lib/payloadMapping/payloadMapping";
import { flattenSelectableLeaves, resolveLeaf } from "../../lib/payloadSchema/payloadSchema";
import { findGroupForField, useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";
import type { OptionsSetup } from "../../types/formStoreTypes";
import type { RepeatableGroup } from "../../types/formStructure";
import type { SchemaLeaf } from "../../types/payloadSchema";
import { useDependencyCandidates } from "../useDependencyCandidates/useDependencyCandidates";
import type {
  UseApiMappingPanelParams,
  UseApiMappingPanelResult,
} from "./useApiMappingPanel.types";

export function useApiMappingPanel({ field }: UseApiMappingPanelParams): UseApiMappingPanelResult {
  const updateFieldApiBinding = useFormStore((state) => state.updateFieldApiBinding);
  const [isAskingOptions, setIsAskingOptions] = useState<boolean>(false);
  const group: RepeatableGroup | null = useFormStore((state) => findGroupForField(state, field.id));
  const binding = field.apiBinding;

  const isExcluded = binding?.kind === "excluded";
  const path = binding?.kind === "mapped" ? binding.path : "";
  const awaitsGroupArrayPath: boolean = group !== null && group.arrayPath === undefined;
  const leaves: SchemaLeaf[] = awaitsGroupArrayPath
    ? []
    : flattenSelectableLeaves(PAYLOAD_SCHEMA, group?.arrayPath);
  const resolvedLeaf: SchemaLeaf | null = path ? resolveLeaf(PAYLOAD_SCHEMA, path) : null;
  const resolvedType = resolvedLeaf?.type ?? null;
  const isOrphan = Boolean(path) && resolvedLeaf === null;
  const isHostPath = Boolean(resolvedLeaf?.providedByHost);
  const showTypeMismatch = Boolean(
    resolvedType && !isHostPath && !fieldMatchesLeaf(field, resolvedType),
  );

  const dataSourceCandidates: CanvasField[] = useDependencyCandidates(field.id);

  // Con un catalogo declarado no hay opciones que autorar: excluir deja de arrastrar al modal.
  const needsOptionsSetup: boolean =
    isOptionBasedField(field.type) &&
    (field.options ?? []).length === 0 &&
    field.dataSource === undefined;

  function handleExcludedToggle(checked: boolean): void {
    if (checked && needsOptionsSetup) {
      setIsAskingOptions(true);
      return;
    }
    updateFieldApiBinding(field.id, checked ? { kind: "excluded" } : null);
  }

  function handleOptionsConfirm(setup: OptionsSetup): void {
    updateFieldApiBinding(field.id, { kind: "excluded" }, setup);
    setIsAskingOptions(false);
  }

  function handlePathChange(nextPath: string): void {
    updateFieldApiBinding(field.id, nextPath ? { kind: "mapped", path: nextPath } : null);
  }

  return {
    isExcluded,
    path,
    leaves,
    isOrphan,
    isHostPath,
    showTypeMismatch,
    resolvedType,
    group,
    awaitsGroupArrayPath,
    dataSourceCandidates,
    isAskingOptions,
    setIsAskingOptions,
    handleExcludedToggle,
    handleOptionsConfirm,
    handlePathChange,
  };
}
