import { useEffect, useRef, useState } from "react";
import { saveDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import { JUST_SAVED_DURATION_MS } from "./useSaveButton.constants";
import type { UseSaveButtonResult } from "./useSaveButton.types";

export function useSaveButton(): UseSaveButtonResult {
  const markSaved = useFormStore((state) => state.markSaved);
  const lastSavedAt = useFormStore((state) => state.lastSavedAt);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);
  const previousSavedAtRef = useRef<string | null>(lastSavedAt);

  function handleSave(): void {
    const { formSteps, introModal, savedComponents, setupConfig } = useFormStore.getState();
    saveDraft({ formSteps, introModal, savedComponents, setupConfig });
    markSaved();
  }

  useEffect(() => {
    if (lastSavedAt === previousSavedAtRef.current) return;
    previousSavedAtRef.current = lastSavedAt;
    if (!lastSavedAt) return;
    setJustSaved(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setJustSaved(false), JUST_SAVED_DURATION_MS);
  }, [lastSavedAt]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return { lastSavedAt, justSaved, handleSave };
}
