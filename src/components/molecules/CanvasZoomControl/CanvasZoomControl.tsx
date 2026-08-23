import { ZOOM_DEFAULT } from "../../../constants/canvasZoom";
import {
  canZoomIn,
  canZoomOut,
  formatZoom,
  zoomIn,
  zoomOut,
} from "../../../lib/canvasZoom/canvasZoom";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { ZOOM_BUTTON_CLASSES } from "./CanvasZoomControl.constants";

export function CanvasZoomControl() {
  const canvasZoom = useFormStore((state) => state.canvasZoom);
  const setCanvasZoom = useFormStore((state) => state.setCanvasZoom);

  return (
    <div className="flex items-center rounded-md border border-slate-200 dark:border-neutral-700">
      <IconButton
        onClick={() => setCanvasZoom(zoomOut(canvasZoom))}
        disabled={!canZoomOut(canvasZoom)}
        title="Alejar el lienzo (Ctrl -)"
        className={ZOOM_BUTTON_CLASSES}
      >
        −
      </IconButton>
      <button
        type="button"
        onClick={() => setCanvasZoom(ZOOM_DEFAULT)}
        title="Volver al 100% (Ctrl 0)"
        className="w-12 py-1.5 text-center text-xs font-medium tabular-nums text-slate-600 hover:text-orange-600 dark:text-neutral-300 dark:hover:text-orange-400 cursor-pointer"
      >
        {formatZoom(canvasZoom)}
      </button>
      <IconButton
        onClick={() => setCanvasZoom(zoomIn(canvasZoom))}
        disabled={!canZoomIn(canvasZoom)}
        title="Acercar el lienzo (Ctrl +)"
        className={ZOOM_BUTTON_CLASSES}
      >
        +
      </IconButton>
    </div>
  );
}
