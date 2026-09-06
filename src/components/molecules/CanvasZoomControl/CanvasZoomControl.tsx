import { useRef, useState } from "react";
import { AngleDown2, Check } from "reicon-react";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
import {
  canZoomIn,
  canZoomOut,
  formatZoom,
  zoomIn,
  zoomOut,
} from "../../../lib/canvasZoom/canvasZoom";
import { useFormStore } from "../../../store/formStore";
import {
  ZOOM_ITEM_CLASSES,
  ZOOM_PRESETS,
  ZOOM_SHORTCUT_CLASSES,
  ZOOM_TRIGGER_CLASSES,
} from "./CanvasZoomControl.constants";

export function CanvasZoomControl() {
  const canvasZoom = useFormStore((state) => state.canvasZoom);
  const setCanvasZoom = useFormStore((state) => state.setCanvasZoom);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // El menu se cierra al elegir: es un salto puntual, no un control que se queda manipulando. Para
  // eso estan la rueda y los atajos, que siguen funcionando con el menu cerrado.
  function apply(zoom: number): void {
    setCanvasZoom(zoom);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        title="Zoom del lienzo"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={ZOOM_TRIGGER_CLASSES}
      >
        {formatZoom(canvasZoom)}
        <AngleDown2 size={12} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 z-20 flex w-44 flex-col rounded-md border border-border bg-surface py-1 shadow-lg">
          <button
            type="button"
            onClick={() => apply(zoomIn(canvasZoom))}
            disabled={!canZoomIn(canvasZoom)}
            className={ZOOM_ITEM_CLASSES}
          >
            Acercar
            <span className={ZOOM_SHORTCUT_CLASSES}>Ctrl +</span>
          </button>
          <button
            type="button"
            onClick={() => apply(zoomOut(canvasZoom))}
            disabled={!canZoomOut(canvasZoom)}
            className={ZOOM_ITEM_CLASSES}
          >
            Alejar
            <span className={ZOOM_SHORTCUT_CLASSES}>Ctrl −</span>
          </button>

          <div className="my-1 border-t border-border-subtle" />

          {ZOOM_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => apply(preset)}
              className={ZOOM_ITEM_CLASSES}
            >
              <span className="tabular-nums">{formatZoom(preset)}</span>
              {preset === canvasZoom ? (
                <Check size={12} weight="Filled" className="text-brand-fg" />
              ) : preset === 1 ? (
                <span className={ZOOM_SHORTCUT_CLASSES}>Ctrl 0</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
