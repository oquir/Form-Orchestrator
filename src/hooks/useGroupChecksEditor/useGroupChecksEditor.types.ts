import type { RepeatableGroup } from "../../types/formStructure";
import type { GroupCheck } from "../../types/groupCheck";

export interface UseGroupChecksEditorParams {
  group: RepeatableGroup;
}

export interface UseGroupChecksEditorResult {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  checks: GroupCheck[];
  activeCount: number;
  knownNames: Set<string>;
  formScript: string;
  addCheck: () => void;
  removeCheck: (id: string) => void;
  patchCheck: (id: string, updates: Partial<GroupCheck>) => void;
}
