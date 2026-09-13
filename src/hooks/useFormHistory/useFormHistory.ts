import { useStore } from "zustand";
import { useFormStore } from "../../store/formStore";
import type { UseFormHistoryResult } from "./useFormHistory.types";

// Lo que la interfaz necesita del historial: si hay algo que deshacer o rehacer, y las dos acciones.
// Se suscribe al store temporal de zundo, que vive aparte del de la aplicacion: los pasos no estan en
// FormState, asi que ningun selector de useFormStore se enteraria de que cambiaron.
export function useFormHistory(): UseFormHistoryResult {
  const canUndo: boolean = useStore(
    useFormStore.temporal,
    (temporal) => temporal.pastStates.length > 0,
  );
  const canRedo: boolean = useStore(
    useFormStore.temporal,
    (temporal) => temporal.futureStates.length > 0,
  );
  const undo = useFormStore((state) => state.undo);
  const redo = useFormStore((state) => state.redo);

  return { canUndo, canRedo, undo, redo };
}
