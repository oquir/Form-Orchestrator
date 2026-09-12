import { useEffect } from "react";
import { ZOOM_DEFAULT } from "../../constants/canvasZoom";
import { zoomIn, zoomOut } from "../../lib/canvasZoom/canvasZoom";
import { saveDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import type { FormState } from "../../types/formStoreTypes";
import { isEditableTarget } from "./useKeyboardShortcuts.utils";

// Ctrl/Cmd+S guarda el mismo borrador que el autoguardado. Se monta en App, sobre FormBuilder,
// para que tambien funcione con el simulador abierto.
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isMod = event.ctrlKey || event.metaKey;
      const state: FormState = useFormStore.getState();

      // Las teclas sueltas son el camino de teclado al cromo que ahora se esconde: si el unico modo
      // de borrar un campo fuera pasar el puntero por encima, quien no usa mouse se queda afuera.
      if (!isMod) {
        if (state.isSimulatorOpen || !state.setupConfig.isComplete) return;
        if (isEditableTarget(event.target)) return;
        if (state.selectedFieldIds.length === 0) return;

        // Con el menu contextual abierto, Escape lo cierra (su propio listener) y ademas
        // deselecciona: las dos cosas son "cancelar", asi que se dejan juntas a proposito.
        if (event.key === "Escape") {
          state.selectField(null);
          return;
        }

        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          for (const fieldId of state.selectedFieldIds) state.removeField(fieldId);
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        if (!state.setupConfig.isComplete) return;

        saveDraft({
          formSteps: state.formSteps,
          introModal: state.introModal,
          formScript: state.formScript,
          setupConfig: state.setupConfig,
        });
        state.markSaved();
        return;
      }

      // El zoom del lienzo se queda con el atajo del navegador: la pagina es una pantalla fija, asi
      // que lo unico que tiene sentido acercar es el lienzo. Con el simulador abierto no hay lienzo.
      // Se escucha "=" ademas de "+" porque en casi todos los teclados comparten tecla y sin Shift
      // el navegador reporta "=", que es lo que la gente teclea de verdad.
      if (state.isSimulatorOpen) return;

      if (key === "+" || key === "=") {
        event.preventDefault();
        state.setCanvasZoom(zoomIn(state.canvasZoom));
      } else if (key === "-") {
        event.preventDefault();
        state.setCanvasZoom(zoomOut(state.canvasZoom));
      } else if (key === "0") {
        event.preventDefault();
        state.setCanvasZoom(ZOOM_DEFAULT);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
