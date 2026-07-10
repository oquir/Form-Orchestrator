import { useEffect } from "react";
import { saveDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import { AUTOSAVE_INTERVAL_MS } from "./useAutosave.constants";

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
