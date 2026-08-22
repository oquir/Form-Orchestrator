import type { PreludeValidation } from "../../types/fieldScript";

export interface UseFormScriptEditorResult {
  formScript: string;
  setFormScript: (next: string) => void;
  knownNames: Set<string>;
  validation: PreludeValidation;
}
