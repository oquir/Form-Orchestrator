import { useMemo } from "react";
import {
  buildFieldGraph,
  describeCycle,
  topologicalOrder,
} from "../../../../lib/fieldGraph/fieldGraph";
import { validateFieldScript } from "../../../../lib/fieldScript/fieldScript";
import { useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import type { FieldGraph } from "../../../../types/fieldGraph";
import type { ScriptValidation } from "../../../../types/fieldScript";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ScriptInput } from "../../../molecules/ScriptInput/ScriptInput";
import {
  DATE_HELPERS_HINT,
  ERROR_CLASSES,
  HINT_CLASSES,
  READS_CLASSES,
  SCRIPT_HINT,
  SCRIPT_PLACEHOLDER,
  SCRIPT_SCOPE_HINT,
  WARNING_CLASSES,
} from "./FieldScriptEditor.constants";
import type { FieldScriptEditorProps } from "./FieldScriptEditor.types";

export function FieldScriptEditor({ field, candidates }: FieldScriptEditorProps) {
  const setFieldScript = useFormStore((state) => state.setFieldScript);
  const formScript = useFormStore((state) => state.formScript);

  const source: string = field.logic.script ?? "";

  // El propio campo entra en los nombres conocidos: asi {mi_campo} se sustituye y se puede avisar
  // de la autorreferencia, en vez de quedar como JS roto sin explicacion.
  const knownNames: Set<string> = useMemo(
    () => new Set([field, ...candidates].map((candidate) => candidate.name)),
    [field, candidates],
  );

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

  return (
    <PanelSection title="Cálculo del campo">
      <ScriptInput
        id="field-script"
        label="Script"
        value={source}
        rows={8}
        knownNames={knownNames}
        placeholder={SCRIPT_PLACEHOLDER}
        insertCandidates={candidates}
        onChange={(next) => setFieldScript(field.id, next)}
      />

      {validation.error && <p className={ERROR_CLASSES}>{validation.error}</p>}

      {cycle && <p className={ERROR_CLASSES}>Dependencia circular: {cycle}.</p>}

      {readsSelf && (
        <p className={WARNING_CLASSES}>
          El script se lee a sí mismo ({field.name}); ese valor no va a poder resolverse. Para leer
          lo que hay escrito en el campo usá <code className="font-mono">value</code>.
        </p>
      )}

      {validation.unknown.length > 0 && (
        <p className={WARNING_CLASSES}>
          {validation.unknown.map((name) => `{${name}}`).join(", ")} no coincide con ningún campo,
          así que se deja tal cual como JavaScript.
        </p>
      )}

      {dependencies.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className={HINT_CLASSES}>Lee estos campos:</span>
          <ul className="flex list-none flex-wrap gap-1">
            {dependencies.map((dependency) => (
              <li key={dependency.id} className={READS_CLASSES} title={dependency.label}>
                {dependency.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={HINT_CLASSES}>{SCRIPT_HINT}</p>
      <p className={HINT_CLASSES}>{SCRIPT_SCOPE_HINT}</p>
      <p className={HINT_CLASSES}>{DATE_HELPERS_HINT}</p>
    </PanelSection>
  );
}
