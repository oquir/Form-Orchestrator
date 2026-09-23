import {
  CANVAS_TOOLBAR_DIVIDER_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from "../../../constants/uiClasses";
import { useFormStore } from "../../../store/formStore";
import { CanvasZoomControl } from "../../molecules/CanvasZoomControl/CanvasZoomControl";
import { RightPanelToggle } from "../../molecules/RightPanelToggle/RightPanelToggle";
import { TransferNotice } from "../../molecules/TransferNotice/TransferNotice";
import { ExportButton } from "../ExportButton/ExportButton";
import { SaveButton } from "../SaveButton/SaveButton";
import { SimulatorButton } from "../SimulatorButton/SimulatorButton";
import { CHIP_CLASSES, NOTICE_CLASSES } from "./CollapsedRightSidebar.constants";

export function CollapsedRightSidebar() {
  const isRightSidebarOpen: boolean = useFormStore((state) => state.isRightSidebarOpen);

  if (isRightSidebarOpen) return null;

  return (
    <>
      {/* A diferencia de CanvasToolbar esto no se apaga fuera de la vista lienzo: guardar, exportar
          y simular tienen que seguir al alcance en JSON y Payload. El unico que sabe de la vista es
          el zoom, y lo resuelve adentro. */}
      {/* Las tres acciones van sin etiqueta: en el panel el texto cabe y ayuda, pero aca el chip
          flota sobre el lienzo y cada palabra le come ancho. El nombre sigue en el title. El zoom
          queda al final porque es el unico que muestra un valor y no una accion. */}
      <div role="toolbar" aria-label="Acciones del formulario" className={CHIP_CLASSES}>
        <SaveButton iconOnly />
        <SimulatorButton iconOnly />
        <ExportButton iconOnly />
        <CanvasZoomControl />
        <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />
        <RightPanelToggle className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES} />
      </div>

      {/* "Mover a paso" de la barra inferior sigue escribiendo el aviso con el panel plegado. Sin
          esto, mover campos perderia en silencio las referencias que quedaron cruzando pasos. */}
      <TransferNotice className={NOTICE_CLASSES} />
    </>
  );
}
