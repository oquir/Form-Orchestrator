import { useState } from "react";
import { createGroupCheck } from "../../lib/groupCheck/groupCheck";
import { useFormStore } from "../../store/formStore";
import type { GroupCheck } from "../../types/groupCheck";
import { useKnownFieldNames } from "../useKnownFieldNames/useKnownFieldNames";
import type {
  UseGroupChecksEditorParams,
  UseGroupChecksEditorResult,
} from "./useGroupChecksEditor.types";

export function useGroupChecksEditor({
  group,
}: UseGroupChecksEditorParams): UseGroupChecksEditorResult {
  const updateGroup = useFormStore((state) => state.updateGroup);
  const formScript = useFormStore((state) => state.formScript);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const checks: GroupCheck[] = group.checks ?? [];
  const knownNames: Set<string> = useKnownFieldNames();

  function write(next: GroupCheck[]): void {
    updateGroup(group.id, { checks: next });
  }

  function addCheck(): void {
    write([...checks, createGroupCheck()]);
  }

  function removeCheck(id: string): void {
    write(checks.filter((other) => other.id !== id));
  }

  function patchCheck(id: string, updates: Partial<GroupCheck>): void {
    write(checks.map((check) => (check.id === id ? { ...check, ...updates } : check)));
  }

  const activeCount: number = checks.filter((check) => check.enabled).length;

  return {
    isOpen,
    setIsOpen,
    toggleOpen: () => setIsOpen((prev) => !prev),
    checks,
    activeCount,
    knownNames,
    formScript,
    addCheck,
    removeCheck,
    patchCheck,
  };
}
