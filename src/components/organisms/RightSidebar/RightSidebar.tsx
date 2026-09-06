import { Play } from "reicon-react";
import { downloadFormExport } from "../../../lib/exportForm/exportForm";
import { useFormStore } from "../../../store/formStore";
import type { RightSidebarTab } from "../../../types/ui";
import { CanvasZoomControl } from "../../molecules/CanvasZoomControl/CanvasZoomControl";
import { FormSummary } from "../../molecules/FormSummary/FormSummary";
import { PanelBlock } from "../../molecules/PanelBlock/PanelBlock";
import { TransferNotice } from "../../molecules/TransferNotice/TransferNotice";
import { ViewModeSwitch } from "../../molecules/ViewModeSwitch/ViewModeSwitch";
import { CanvasTabs } from "../CanvasTabs/CanvasTabs";
import { SaveButton } from "../SaveButton/SaveButton";
import { StepTitleEditor } from "../StepTitleEditor/StepTitleEditor";
import {
  EXPORT_BUTTON_CLASSES,
  PANEL_TAB_ACTIVE_CLASSES,
  PANEL_TAB_BASE_CLASSES,
  PANEL_TAB_DROP_DOT_CLASSES,
  PANEL_TAB_INACTIVE_CLASSES,
  SIMULATOR_BUTTON_CLASSES,
  TABS,
} from "./RightSidebar.constants";

export function RightSidebar() {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const formScript = useFormStore((state) => state.formScript);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const setSimulatorOpen = useFormStore((state) => state.setSimulatorOpen);
  const viewMode = useFormStore((state) => state.canvasViewMode);
  const setViewMode = useFormStore((state) => state.setCanvasViewMode);
  const activeTab = useFormStore((state) => state.rightSidebarTab);
  const setActiveTab = useFormStore((state) => state.setRightSidebarTab);
  const rowDrag = useFormStore((state) => state.rowDrag);
  const draggingFieldId = useFormStore((state) => state.draggingFieldId);

  const isIntro: boolean = activeCanvas.type === "introStep";
  const isCanvasView: boolean = viewMode === "canvas";
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
  // pestaña que el usuario eligio. Lo que antes lo hacia inviable -- abrir el panel reacomodaba el
  // lienzo debajo del puntero, a mitad del gesto -- ya no aplica: el ancho del panel es fijo.
  const isTransferring: boolean = rowDrag !== null || draggingFieldId !== null;
  const visibleTab: RightSidebarTab = isTransferring ? "steps" : activeTab;

  return (
    <div className="flex h-full flex-col">
      {/* Guardar a la izquierda, las dos salidas a la derecha: Simulador es el "reproducir" y
          Exportar la unica accion primaria del panel. */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <SaveButton />
        <button
          type="button"
          onClick={() => setSimulatorOpen(true)}
          className={`ml-auto ${SIMULATOR_BUTTON_CLASSES}`}
        >
          <Play size={12} weight="Filled" />
          Simulador
        </button>
        <button
          type="button"
          onClick={() => downloadFormExport(formSteps, setupConfig, introSteps, formScript)}
          title="Descargar la configuración del formulario como JSON"
          className={EXPORT_BUTTON_CLASSES}
        >
          Exportar
        </button>
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
        {isCanvasView && (
          <div className="ml-auto flex items-center">
            <CanvasZoomControl />
          </div>
        )}
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

            <PanelBlock title="Formulario">
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
    </div>
  );
}
