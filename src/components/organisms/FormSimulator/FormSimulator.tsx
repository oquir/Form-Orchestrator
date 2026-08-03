import { ArrowLeft, Moon, Sun } from "reicon-react";
import { useFormPreview } from "../../../hooks/useFormPreview/useFormPreview";
import { useFormStore } from "../../../store/formStore";
import type { FormPreviewApi } from "../../../types/formPreview";
import { PreviewForm } from "../preview/PreviewForm/PreviewForm";
import { PreviewResults } from "../preview/PreviewResults/PreviewResults";
import { EXIT_BUTTON_CLASSES, ICON_BUTTON_CLASSES } from "./FormSimulator.constants";

export function FormSimulator() {
  const preview: FormPreviewApi = useFormPreview();
  const setSimulatorOpen = useFormStore((state) => state.setSimulatorOpen);
  const isDarkMode = useFormStore((state) => state.isDarkMode);
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-sunken text-fg">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-fg-strong">Simulador</h1>
          <p className="text-xs text-fg-muted">
            El formulario funcionando, armado solo con el JSON exportado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
            aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
            className={ICON_BUTTON_CLASSES}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setSimulatorOpen(false)}
            className={EXIT_BUTTON_CLASSES}
          >
            <ArrowLeft size={14} />
            Volver al lienzo
          </button>
        </div>
      </header>

      {/* En desktop cada panel scrollea por su cuenta y ocupa todo el alto; abajo de lg la
          pagina vuelve a scrollear entera para no aplastar los dos en media pantalla. */}
      <div className="min-h-0 flex-1 overflow-auto px-6 py-6 lg:overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-4 lg:h-full lg:grid-cols-[minmax(0,2fr)_minmax(0,420px)]">
          <div className="min-w-0 lg:min-h-0 lg:overflow-auto">
            <PreviewForm preview={preview} />
          </div>
          <div className="min-w-0 lg:min-h-0">
            <PreviewResults preview={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
