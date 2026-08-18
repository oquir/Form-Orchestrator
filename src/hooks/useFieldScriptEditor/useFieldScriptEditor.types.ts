import type { CanvasField } from "../../types/field";
import type { ScriptValidation } from "../../types/fieldScript";

export interface UseFieldScriptEditorParams {
  field: CanvasField;
  candidates: CanvasField[];
}

export interface UseFieldScriptEditorResult {
  source: string;
  knownNames: Set<string>;
  validation: ScriptValidation;
  cycle: string | null;
  readsSelf: boolean;
  dependencies: CanvasField[];
  handleChange: (next: string) => void;
}
