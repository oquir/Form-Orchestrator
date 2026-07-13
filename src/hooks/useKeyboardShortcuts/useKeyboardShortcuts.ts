import { useEffect } from "react";
import { saveDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMod = event.ctrlKey || event.metaKey;
      if (!isMod) return;

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        const state = useFormStore.getState();
        if (!state.setupConfig.isComplete) return;
        saveDraft({
          formSteps: state.formSteps,
          introModal: state.introModal,
          savedComponents: state.savedComponents,
          setupConfig: state.setupConfig,
        });
        state.markSaved();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
