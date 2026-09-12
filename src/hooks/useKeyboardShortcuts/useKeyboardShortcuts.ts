import { useEffect } from "react";
import { CANVAS_TOOLS } from "../../constants/canvasTool";
import { ZOOM_DEFAULT } from "../../constants/canvasZoom";
import { confirmFieldRemoval } from "../../lib/canvasSelection/canvasSelection";
import { zoomIn, zoomOut } from "../../lib/canvasZoom/canvasZoom";
import { saveDraft } from "../../lib/persistence/persistence";
import { getActiveRows, getAllFields, useFormStore } from "../../store/formStore";
import type { FormState } from "../../types/formStoreTypes";
import type { CanvasTool, CanvasToolItem } from "../../types/ui";
import { isEditableTarget, isPointerOverCanvas } from "./useKeyboardShortcuts.utils";

// Atajos globales del constructor. Ctrl/Cmd+S guarda el mismo borrador que el autoguardado; se monta
// en App, sobre FormBuilder, para que tambien funcione con el simulador abierto. El zoom, las
// herramientas y la seleccion solo tienen sentido con el lienzo a la vista.
export function useKeyboardShortcuts() {
  useEffect(() => {
    // La herramienta de antes de sostener Espacio; null mientras Espacio no esta sostenido.
    let toolBeforeSpace: CanvasTool | null = null;

    function releaseSpace(): void {
      if (toolBeforeSpace === null) return;

      useFormStore.getState().setCanvasTool(toolBeforeSpace);
      toolBeforeSpace = null;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const isMod = event.ctrlKey || event.metaKey;
      const state: FormState = useFormStore.getState();

      // Las teclas sueltas son el camino de teclado al cromo que ahora se esconde: si el unico modo
      // de borrar un campo fuera pasar el puntero por encima, quien no usa mouse se queda afuera.
      if (!isMod) {
        if (state.isSimulatorOpen || !state.setupConfig.isComplete) return;
        if (isEditableTarget(event.target)) return;

        const isCanvasView: boolean = state.canvasViewMode === "canvas";

        // Espacio sostenido es la mano temporal de Figma. Solo con el puntero sobre el lienzo: con
        // el foco en un boton de los paneles, Espacio tiene que seguir activandolo. preventDefault
        // tambien en la repeticion, o el puerto se desplazaria como con un Espacio comun.
        if (event.key === " " && isCanvasView && isPointerOverCanvas()) {
          event.preventDefault();
          if (event.repeat || toolBeforeSpace !== null) return;

          toolBeforeSpace = state.canvasTool;
          state.setCanvasTool("hand");
          return;
        }

        const tool: CanvasToolItem | undefined = CANVAS_TOOLS.find(
          (item) => item.shortcut.toLowerCase() === event.key.toLowerCase(),
        );

        if (tool && isCanvasView && !event.altKey) {
          event.preventDefault();
          // Con Espacio sostenido la tecla elige a que herramienta se vuelve al soltarlo.
          if (toolBeforeSpace !== null) toolBeforeSpace = tool.tool;
          else state.setCanvasTool(tool.tool);
          return;
        }

        if (state.selectedFieldIds.length === 0) return;

        // Con el menu contextual abierto, Escape lo cierra (su propio listener) y ademas
        // deselecciona: las dos cosas son "cancelar", asi que se dejan juntas a proposito.
        if (event.key === "Escape") {
          state.selectField(null);
          return;
        }

        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          if (confirmFieldRemoval(state.selectedFieldIds.length)) {
            state.removeFields(state.selectedFieldIds);
          }
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

      if (state.isSimulatorOpen) return;

      // Seleccionar todo el paso. Dentro de un input o fuera de la vista lienzo queda el Ctrl+A del
      // navegador, que ahi si significa algo.
      if (key === "a") {
        if (!state.setupConfig.isComplete || state.canvasViewMode !== "canvas") return;
        if (isEditableTarget(event.target)) return;

        event.preventDefault();
        state.setFieldSelection(getAllFields(getActiveRows(state)).map((field) => field.id));
        return;
      }

      // El zoom del lienzo se queda con el atajo del navegador: la pagina es una pantalla fija, asi
      // que lo unico que tiene sentido acercar es el lienzo. Con el simulador abierto no hay lienzo.
      // Se escucha "=" ademas de "+" porque en casi todos los teclados comparten tecla y sin Shift
      // el navegador reporta "=", que es lo que la gente teclea de verdad.
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

    // El blur cubre soltar Espacio con la ventana en segundo plano, que nunca manda keyup: sin el,
    // la mano quedaria puesta al volver.
    function handleKeyUp(event: KeyboardEvent): void {
      if (event.key !== " " || toolBeforeSpace === null) return;

      event.preventDefault();
      releaseSpace();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseSpace);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseSpace);
    };
  }, []);
}
