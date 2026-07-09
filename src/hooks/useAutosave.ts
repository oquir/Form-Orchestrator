import { useEffect } from "react";
import { saveDraft } from "../lib/persistence";
import { useFormStore } from "../store/formStore";

const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;

export function useAutosave() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const { formSteps, introModal, savedComponents, setupConfig, markSaved } =
        useFormStore.getState();
      if (!setupConfig.isComplete) return;
      saveDraft({ formSteps, introModal, savedComponents, setupConfig });
      markSaved();
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);
}
