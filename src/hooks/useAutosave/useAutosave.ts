import { useEffect } from "react";
import { saveDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import { AUTOSAVE_INTERVAL_MS } from "./useAutosave.constants";

// Guarda el borrador cada cierto tiempo. Vive en App, por encima de FormBuilder, para que siga
// corriendo mientras el simulador ocupa la pantalla completa.
export function useAutosave() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Se lee con getState y no con un selector: suscribirse volveria a montar el intervalo en
      // cada tecla que el usuario escriba en el lienzo.
      const { formSteps, introModal, savedComponents, setupConfig, markSaved } =
        useFormStore.getState();

      // Antes de terminar el asistente no hay nada que valga la pena guardar.
      if (!setupConfig.isComplete) return;

      saveDraft({ formSteps, introModal, savedComponents, setupConfig });
      markSaved();
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);
}
