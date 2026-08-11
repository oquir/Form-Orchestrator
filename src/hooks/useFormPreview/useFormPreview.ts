import { useCallback, useEffect, useMemo, useState } from "react";
import { hasFills, resolveFills } from "../../lib/catalogFill/catalogFill";
import { buildFormExport } from "../../lib/exportForm/exportForm";
import {
  buildRuntimeModel,
  createInitialState,
  resolveRuntime,
} from "../../lib/formRuntime/formRuntime";
import { catalogOptions } from "../../lib/mockCatalog/mockCatalog";
import { buildPayload } from "../../lib/runtimePayload/runtimePayload";
import { validateRuntime } from "../../lib/runtimeValidation/runtimeValidation";
import { useFormStore } from "../../store/formStore";
import type { ExportedField } from "../../types/exportForm";
import type { FormPreviewApi } from "../../types/formPreview";
import type {
  PreviewState,
  RuntimeModel,
  RuntimeSnapshot,
  RuntimeValues,
} from "../../types/formRuntime";
import { emptyGroupItem, reconcileState } from "./useFormPreview.utils";

// El unico sitio donde el simulador toca el store, y solo para alimentar a buildFormExport.
// Las respuestas viven aca, en el arbol de componentes, nunca en el store: son desechables y
// cambiar de vista las descarta. Cambiar despues a react-hook-form seria reemplazar este hook.
export function useFormPreview(): FormPreviewApi {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const catalogBank = useFormStore((state) => state.catalogBank);
  const formScript = useFormStore((state) => state.formScript);

  // El simulador solo ve el JSON exportado. Si algo falta en el contrato, se rompe aca igual
  // que se romperia en el aplicativo que lo consume.
  const model: RuntimeModel = useMemo(
    () => buildRuntimeModel(buildFormExport(formSteps, setupConfig, introSteps, formScript)),
    [formSteps, setupConfig, introSteps, formScript],
  );

  const [state, setState] = useState<PreviewState>(() => createInitialState(model));
  // Los errores se revelan por clave, no de golpe: un campo al que todavia no se llego nunca
  // aparece en rojo. El panel de resultados si los lista todos, que es la vista global.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState((previous) => reconcileState(model, previous));
  }, [model]);

  const snapshot: RuntimeSnapshot = useMemo(() => resolveRuntime(model, state), [model, state]);
  const validation = useMemo(() => validateRuntime(model, snapshot), [model, snapshot]);
  const payload = useMemo(() => buildPayload(model, snapshot), [model, snapshot]);

  const setValue = useCallback(
    (name: string, value: unknown, groupId?: string, index?: number) => {
      setState((previous) => {
        const item: RuntimeValues =
          groupId !== undefined && index !== undefined
            ? (previous.groups[groupId]?.[index] ?? {})
            : {};
        const field: ExportedField | undefined = model.fieldsByName.get(name);

        // Las columnas de la opcion elegida se copian a sus campos hermanos, y se copian al mismo
        // ambito: sin eso, elegir la actividad de la fila 3 llenaria la tarifa de la fila 1.
        //
        // El catalogo se arma solo cuando el campo declara rellenos. catalogOptions sobre
        // actividades construye 425 opciones y esto corre en cada tecla de cada campo.
        const filled: RuntimeValues =
          field && hasFills(field)
            ? resolveFills(
                field,
                value,
                catalogOptions(field, { ...previous.values, ...item }, catalogBank),
              )
            : {};

        if (groupId === undefined || index === undefined) {
          return { ...previous, values: { ...previous.values, [name]: value, ...filled } };
        }

        const items = [...(previous.groups[groupId] ?? [])];
        items[index] = { ...items[index], [name]: value, ...filled };

        return { ...previous, groups: { ...previous.groups, [groupId]: items } };
      });
    },
    [model, catalogBank],
  );

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
