import { AngleLeft2, AngleRight2, Play } from "reicon-react";
import { VIEW_MODE_TABS } from "../../../constants/canvasView";
import { FORM_TYPES } from "../../../constants/formType";
import { downloadFormExport } from "../../../lib/exportForm/exportForm";
import { useFormStore } from "../../../store/formStore";
import { PanelHeader } from "../../atoms/PanelHeader/PanelHeader";
import { CanvasZoomControl } from "../../molecules/CanvasZoomControl/CanvasZoomControl";
import { PanelSection } from "../../molecules/PanelSection/PanelSection";
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
  const formTypeLabel: string =
    FORM_TYPES.find((option) => option.value === setupConfig.formType)?.label ?? "Sin definir";
  const stepCountLabel: string = `${formSteps.length} step${formSteps.length === 1 ? "" : "s"}`;

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

      <section
        aria-label="Panel del formulario"
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
      >
        <PanelHeader
          title={isIntro ? "Modal de entrada" : "Formulario"}
          subtitle={isIntro ? "Flota sobre el formulario" : undefined}
        />

        {/* min-h-0 es lo que deja que este flex item se encoja por debajo de su contenido: sin el,
            el desborde se escapa del panel en vez de recortarse aca, y el scroll vertical que el
            panel entero no debe tener aparece de todos modos. */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <TransferNotice />

          <PanelSection
            title="Proyecto"
            aside={
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                {formTypeLabel}
              </span>
            }
          >
            <div className="[&>nav]:border-0 [&>nav]:px-0 [&>nav]:py-0">
              <TabButtonGroup tabs={VIEW_MODE_TABS} activeTab={viewMode} onSelect={setViewMode} />
            </div>
            {isCanvasView && <CanvasZoomControl />}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-neutral-800">
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
            </div>
          </PanelSection>

          {/* Los steps van segundos ahora que el panel entero no rueda: la razon por la que iban
              primero era justamente que un panel con scroll dejaba la zona de soltar fuera de
              alcance -- ver CLAUDE.md, "The right panel". Sin scroll esa razon no aplica. */}
          <PanelSection
            title="Steps"
            aside={
              <span className="text-[10px] font-medium text-slate-400 dark:text-neutral-500">
                {stepCountLabel}
              </span>
            }
          >
            <CanvasTabs />
            <div className="border-t border-slate-100 pt-3 dark:border-neutral-800">
              <StepTitleEditor />
            </div>
          </PanelSection>
        </div>
      </section>
    </div>
  );
}
