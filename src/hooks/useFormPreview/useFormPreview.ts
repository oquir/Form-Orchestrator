import { useCallback, useEffect, useMemo, useState } from "react";
import { buildFormExport } from "../../lib/exportForm/exportForm";
import {
  buildRuntimeModel,
  createInitialState,
  resolveRuntime,
} from "../../lib/formRuntime/formRuntime";
import { buildPayload } from "../../lib/runtimePayload/runtimePayload";
import { validateRuntime } from "../../lib/runtimeValidation/runtimeValidation";
import { useFormStore } from "../../store/formStore";
import type { FormPreviewApi } from "../../types/formPreview";
import type { PreviewState, RuntimeModel, RuntimeSnapshot } from "../../types/formRuntime";
import { emptyGroupItem, reconcileState } from "./useFormPreview.utils";

export function useFormPreview(): FormPreviewApi {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const catalogBank = useFormStore((state) => state.catalogBank);

  // El simulador solo ve el JSON exportado. Si algo falta en el contrato, se rompe aca igual
  // que se romperia en el aplicativo que lo consume.
  const model: RuntimeModel = useMemo(
    () => buildRuntimeModel(buildFormExport(formSteps, setupConfig, introSteps)),
    [formSteps, setupConfig, introSteps],
  );

  const [state, setState] = useState<PreviewState>(() => createInitialState(model));
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState((previous) => reconcileState(model, previous));
  }, [model]);

  const snapshot: RuntimeSnapshot = useMemo(() => resolveRuntime(model, state), [model, state]);
  const validation = useMemo(() => validateRuntime(model, snapshot), [model, snapshot]);
  const payload = useMemo(() => buildPayload(model, snapshot), [model, snapshot]);

  const setValue = useCallback((name: string, value: unknown, groupId?: string, index?: number) => {
    setState((previous) => {
      if (groupId === undefined || index === undefined) {
        return { ...previous, values: { ...previous.values, [name]: value } };
      }

      const items = [...(previous.groups[groupId] ?? [])];
      items[index] = { ...items[index], [name]: value };

      return { ...previous, groups: { ...previous.groups, [groupId]: items } };
    });
  }, []);

  const addGroupItem = useCallback(
    (groupId: string) => {
      setState((previous) => ({
        ...previous,
        groups: {
          ...previous.groups,
          [groupId]: [...(previous.groups[groupId] ?? []), emptyGroupItem(model, groupId)],
        },
      }));
    },
    [model],
  );

  const removeGroupItem = useCallback((groupId: string, index: number) => {
    setState((previous) => ({
      ...previous,
      groups: {
        ...previous.groups,
        [groupId]: (previous.groups[groupId] ?? []).filter((_, position) => position !== index),
      },
    }));
  }, []);

  const validateKeys = useCallback(
    (keys: string[]): boolean => {
      setRevealed((previous) => {
        const next: Record<string, boolean> = { ...previous };
        for (const key of keys) next[key] = true;

        return next;
      });

      return keys.every((key) => validation.errors[key] === undefined);
    },
    [validation.errors],
  );

  const reset = useCallback(() => {
    setState(createInitialState(model));
    setRevealed({});
  }, [model]);

  return {
    model,
    catalogBank,
    state,
    snapshot,
    errors: validation.errors,
    issues: validation.issues,
    payload,
    revealed,
    setValue,
    addGroupItem,
    removeGroupItem,
    validateKeys,
    reset,
  };
}
