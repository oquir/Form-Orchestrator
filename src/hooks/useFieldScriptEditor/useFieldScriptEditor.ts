import { useMemo, useState } from "react";
import { buildFieldGraph, describeCycle, topologicalOrder } from "../../lib/fieldGraph/fieldGraph";
import { isNumericField } from "../../lib/fieldKind/fieldKind";
import { validateFieldScript } from "../../lib/fieldScript/fieldScript";
import { useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";
import type { FieldGraph } from "../../types/fieldGraph";
import type { ScriptValidation } from "../../types/fieldScript";
import { useKnownFieldNames } from "../useKnownFieldNames/useKnownFieldNames";
import type {
  UseFieldScriptEditorParams,
  UseFieldScriptEditorResult,
} from "./useFieldScriptEditor.types";

export function useFieldScriptEditor({
  field,
  candidates,
}: UseFieldScriptEditorParams): UseFieldScriptEditorResult {
  const setFieldScript = useFormStore((state) => state.setFieldScript);
  const formScript = useFormStore((state) => state.formScript);

  const source: string = field.logic.script ?? "";

  // El propio campo entra en los nombres conocidos: asi {{mi_campo}} se sustituye y se puede avisar
  // de la autorreferencia, en vez de marcarlo como un campo que no existe.
  const knownNames: Set<string> = useKnownFieldNames();

  const validation: ScriptValidation = useMemo(
    () => validateFieldScript(source, knownNames, formScript),
    [source, knownNames, formScript],
  );

  // El ciclo se avisa, no se bloquea: el script es texto libre y trabar la escritura a mitad de
  // una palabra seria pelearse con quien escribe. Los editores de condiciones si lo bloquean
  // porque ahi se elige de una lista y no hay estado intermedio.
  const cycle: string | null = useMemo(() => {
    const graph: FieldGraph = buildFieldGraph([field, ...candidates]);
    const found: string[] | null = topologicalOrder(graph).cycle;

    return found?.includes(field.id) ? describeCycle(graph, found) : null;
  }, [field, candidates]);

  const readsSelf: boolean = validation.reads.includes(field.name);
  const dependencies: CanvasField[] = validation.reads.flatMap((name) => {
    const found: CanvasField | undefined = candidates.find((candidate) => candidate.name === name);

    return found ? [found] : [];
  });

  // El calculo sin codigo solo suma y resta numeros: en un campo de texto no tiene nada que armar.
  const offersSimpleCalc: boolean = isNumericField(field.type);
  const [isSimpleCalcOpen, setIsSimpleCalcOpen] = useState<boolean>(false);

  function handleChange(next: string): void {
    setFieldScript(field.id, next);
  }

  function openSimpleCalc(): void {
    setIsSimpleCalcOpen(true);
  }

  function closeSimpleCalc(): void {
    setIsSimpleCalcOpen(false);
  }

  return {
    source,
    knownNames,
    validation,
    cycle,
    readsSelf,
    dependencies,
    handleChange,
    offersSimpleCalc,
    isSimpleCalcOpen,
    openSimpleCalc,
    closeSimpleCalc,
  };
}
