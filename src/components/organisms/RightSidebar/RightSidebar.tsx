import { useState } from "react";
import { useFormStore } from "../../../store/formStore";
import type { RightSidebarTab } from "../../../types/ui";
import { CanvasZoomControl } from "../../molecules/CanvasZoomControl/CanvasZoomControl";
import { FormSummary } from "../../molecules/FormSummary/FormSummary";
import { PanelBlock } from "../../molecules/PanelBlock/PanelBlock";
import { RightPanelToggle } from "../../molecules/RightPanelToggle/RightPanelToggle";
import { TransferNotice } from "../../molecules/TransferNotice/TransferNotice";
import { ViewModeSwitch } from "../../molecules/ViewModeSwitch/ViewModeSwitch";
import { CanvasTabs } from "../CanvasTabs/CanvasTabs";
import { ExportButton } from "../ExportButton/ExportButton";
import { ProjectImportModal } from "../ProjectImportModal/ProjectImportModal";
import { SaveButton } from "../SaveButton/SaveButton";
import { SimulatorButton } from "../SimulatorButton/SimulatorButton";
import { StepTitleEditor } from "../StepTitleEditor/StepTitleEditor";
import {
  OPEN_PROJECT_BUTTON_CLASSES,
  PANEL_COLLAPSE_BUTTON_CLASSES,
  PANEL_TAB_ACTIVE_CLASSES,
  PANEL_TAB_BASE_CLASSES,
  PANEL_TAB_DROP_DOT_CLASSES,
  PANEL_TAB_INACTIVE_CLASSES,
  TABS,
} from "./RightSidebar.constants";

export function RightSidebar() {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const viewMode = useFormStore((state) => state.canvasViewMode);
  const setViewMode = useFormStore((state) => state.setCanvasViewMode);
  const activeTab = useFormStore((state) => state.rightSidebarTab);
  const setActiveTab = useFormStore((state) => state.setRightSidebarTab);
  const rowDrag = useFormStore((state) => state.rowDrag);
  const draggingFieldId = useFormStore((state) => state.draggingFieldId);
  const [isImportOpen, setImportOpen] = useState<boolean>(false);

  const isIntro: boolean = activeCanvas.type === "introStep";
  const canvasLabel: string = isIntro ? "Modal de entrada" : "Formulario";

  // El chip del paso activo ya no lleva su nombre, asi que el numero tiene que reaparecer aca: es
  // lo unico que ata el "3" de la grilla con el titulo que se esta editando debajo.
  const activeStepIndex: number = (isIntro ? introSteps : formSteps).findIndex(
    (step) => step.stepId === activeCanvas.stepId,
  );
  const activeStepLabel: string =
    activeStepIndex >= 0 ? `Paso ${activeStepIndex + 1} · ${canvasLabel}` : canvasLabel;
  const stepCountLabel: string = `${formSteps.length} ${formSteps.length === 1 ? "paso" : "pasos"}`;

  // Mientras hay un arrastre manda la pestaña de steps: es la unica que dibuja las pestañas de
  // paso, o sea las zonas de soltar para mudar un campo o una fila a otro step, y desde Proyecto
  // esa mudanza no tendria a donde apuntar. Es derivado y no un set: al soltar vuelve solo a la
  // pestaña que el usuario eligio. El panel ahora se pliega, pero eso no reabre el viejo problema
  // de reacomodar el lienzo a mitad del gesto: mientras existe su ancho es fijo, y el unico modo de
  // plegarlo es un boton, que no se puede pulsar con una fila colgando del cursor.
  const isTransferring: boolean = rowDrag !== null || draggingFieldId !== null;
  const visibleTab: RightSidebarTab = isTransferring ? "steps" : activeTab;

  return (
    <div className="flex h-full flex-col">
      {/* Guardar a la izquierda, las salidas a la derecha: Simulador es el "reproducir" y Exportar
          la unica accion primaria del panel. El ml-auto va en el grupo y no en el primer boton para
          que ninguno de los tres necesite saber donde lo montan. */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <SaveButton />
        <div className="ml-auto flex items-center gap-1.5">
          <SimulatorButton />
          <ExportButton />
          <RightPanelToggle className={PANEL_COLLAPSE_BUTTON_CLASSES} iconSize={14} />
        </div>
      </div>

      {/* El zoom vive aca y no dentro de Proyecto porque es del lienzo, no de una seccion: se
          mantiene visible con cualquiera de las dos pestañas abiertas. */}
      <nav
        aria-label="Secciones del panel"
        className="flex items-stretch gap-0.5 border-b border-border px-3"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`${PANEL_TAB_BASE_CLASSES} ${
              visibleTab === tab.id ? PANEL_TAB_ACTIVE_CLASSES : PANEL_TAB_INACTIVE_CLASSES
            }`}
          >
            {tab.label}
            {isTransferring && tab.id === "steps" && (
              <span className={PANEL_TAB_DROP_DOT_CLASSES} />
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center">
          <CanvasZoomControl />
        </div>
      </nav>

      {/* min-h-0 es lo que deja que este flex item se encoja por debajo de su contenido: sin el,
          el desborde se escapa del panel en vez de recortarse aca, y el scroll vertical que el
          panel entero no debe tener aparece de todos modos. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TransferNotice />

        {visibleTab === "project" && (
          <>
            <PanelBlock title="Vista">
              <ViewModeSwitch activeMode={viewMode} onSelect={setViewMode} />
            </PanelBlock>

            <PanelBlock
              title="Formulario"
              action={
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  title="Abrir un formulario exportado"
                  className={OPEN_PROJECT_BUTTON_CLASSES}
                >
                  Abrir…
                </button>
              }
            >
              <FormSummary />
            </PanelBlock>
          </>
        )}

        {visibleTab === "steps" && (
          <>
            <PanelBlock
              title="Pasos"
              action={<span className="text-[10px] text-fg-subtle">{stepCountLabel}</span>}
            >
              <CanvasTabs />
            </PanelBlock>

            <PanelBlock
              title="Paso activo"
              action={<span className="text-[10px] text-fg-subtle">{activeStepLabel}</span>}
            >
              <StepTitleEditor />
            </PanelBlock>
          </>
        )}
      </div>

      {isImportOpen && <ProjectImportModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
