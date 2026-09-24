import { useMemo } from "react";
import { getAllFields, useFormStore } from "../../store/formStore";
import type { CanvasRow } from "../../types/formStructure";

// Los nombres contra los que un editor de script decide si un {{x}} es un campo: los de los dos
// lienzos, igual que buildFormExport y la revision antes de exportar. Si el editor mirara menos
// -- solo los pasos del formulario, como hacia --, un campo del modal de entrada saldria en rojo
// al editar y compilaria bien al exportar: el caso de periodo_anio en los renglones 31 y 37.
export function useKnownFieldNames(): Set<string> {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);

  return useMemo(() => {
    const rows: CanvasRow[] = [
      ...formSteps.flatMap((step) => step.rows),
      ...introSteps.flatMap((step) => step.rows),
    ];

    return new Set(getAllFields(rows).map((field) => field.name));
  }, [formSteps, introSteps]);
}
