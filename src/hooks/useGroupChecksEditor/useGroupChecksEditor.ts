import { useMemo, useState } from "react";
import { createGroupCheck } from "../../lib/groupCheck/groupCheck";
import { getAllFields, useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";
import type { GroupCheck } from "../../types/groupCheck";
import type {
  UseGroupChecksEditorParams,
  UseGroupChecksEditorResult,
} from "./useGroupChecksEditor.types";

export function useGroupChecksEditor({
  group,
}: UseGroupChecksEditorParams): UseGroupChecksEditorResult {
  const updateGroup = useFormStore((state) => state.updateGroup);
  const formSteps = useFormStore((state) => state.formSteps);
  const formScript = useFormStore((state) => state.formScript);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const checks: GroupCheck[] = group.checks ?? [];
  const candidates: CanvasField[] = useMemo(
    () => getAllFields(formSteps.flatMap((step) => step.rows)),
    [formSteps],
  );
  const knownNames: Set<string> = useMemo(
    () => new Set(candidates.map((field) => field.name)),
    [candidates],
  );

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
    candidates,
    knownNames,
    formScript,
    addCheck,
    removeCheck,
    patchCheck,
  };
}
