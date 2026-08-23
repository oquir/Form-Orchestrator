import { AngleLeft2, AngleRight2, Play } from "reicon-react";
import { VIEW_MODE_TABS } from "../../../constants/canvasView";
import { downloadFormExport } from "../../../lib/exportForm/exportForm";
import { useFormStore } from "../../../store/formStore";
import { PanelHeader } from "../../atoms/PanelHeader/PanelHeader";
import { SidebarSection } from "../../atoms/SidebarSection/SidebarSection";
import { CanvasZoomControl } from "../../molecules/CanvasZoomControl/CanvasZoomControl";
import { TabButtonGroup } from "../../molecules/TabButtonGroup/TabButtonGroup";
import { TransferNotice } from "../../molecules/TransferNotice/TransferNotice";
import { CanvasTabs } from "../CanvasTabs/CanvasTabs";
import { SaveButton } from "../SaveButton/SaveButton";
import { StepTitleEditor } from "../StepTitleEditor/StepTitleEditor";
import {
  COLLAPSE_BUTTON_CLASSES,
  EXPORT_BUTTON_CLASSES,
  SIMULATOR_BUTTON_CLASSES,
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
  const isOpen = useFormStore((state) => state.isRightSidebarOpen);
  const setOpen = useFormStore((state) => state.setRightSidebarOpen);

  const isIntro: boolean = activeCanvas.type === "introStep";
  const isCanvasView: boolean = viewMode === "canvas";

  return (
    <div className="flex h-full">
      {/* La tira va a la izquierda del panel, o sea del lado del lienzo: es el borde que sobrevive
          al plegado, porque el overflow-hidden del aside recorta por la derecha. */}
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-slate-200 bg-slate-50 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          title={isOpen ? "Ocultar el panel" : "Mostrar el panel"}
          aria-label={isOpen ? "Ocultar el panel" : "Mostrar el panel"}
          className={COLLAPSE_BUTTON_CLASSES}
        >
          {isOpen ? <AngleRight2 size={18} /> : <AngleLeft2 size={18} />}
        </button>
      </div>

      <section aria-label="Panel del formulario" className="flex min-w-0 flex-1 flex-col">
        <PanelHeader
          title={isIntro ? "Modal de entrada" : "Formulario"}
          subtitle={
            isIntro
              ? "Flota sobre el formulario"
              : `${formSteps.length} step${formSteps.length === 1 ? "" : "s"}`
          }
        />

        <div className="flex-1 overflow-y-auto p-4">
          <TransferNotice />

          {/* Los steps van primero a proposito: son zonas de soltar para mudar un campo o una fila
              de paso, y tienen que estar a la vista sin rodar el panel. */}
          <SidebarSection title="Steps">
            <CanvasTabs />
          </SidebarSection>

          <SidebarSection title="Step actual">
            <StepTitleEditor />
          </SidebarSection>

          <SidebarSection title="Vista">
            <TabButtonGroup tabs={VIEW_MODE_TABS} activeTab={viewMode} onSelect={setViewMode} />
            {isCanvasView && <CanvasZoomControl />}
          </SidebarSection>

          <SidebarSection title="Proyecto">
            <SaveButton />
            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              className={SIMULATOR_BUTTON_CLASSES}
            >
              <Play size={12} weight="Filled" />
              Simulador
            </button>
            <button
              type="button"
              onClick={() => downloadFormExport(formSteps, setupConfig, introSteps, formScript)}
              className={EXPORT_BUTTON_CLASSES}
            >
              Exportar JSON
            </button>
          </SidebarSection>
        </div>
      </section>
    </div>
  );
}
