import { useRef } from "react";
import { Palette } from "reicon-react";
import {
  ROW_TOOLBAR_ICON_ITEM_CLASSES,
  ROW_TOOLBAR_POPOVER_CLASSES,
} from "../../../constants/uiClasses";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
import { useFormStore } from "../../../store/formStore";
import { Label } from "../../atoms/Label/Label";
import { Textarea } from "../../atoms/TextArea/Textarea";
import { TwoColumnFieldGroup } from "../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { CssValidationHint } from "../../molecules/CssValidationHint/CssValidationHint";
import { PxInput } from "../../molecules/PxInput/PxInput";
import type { RowStylesMenuProps } from "./RowStylesMenu.types";

// Mismo icono que la pestaña "Estilos" de un campo (Sidebar.constants): es el mismo concepto, un
// nivel mas arriba. A proposito no ofrece color de fondo ni de texto -- ver el comentario en
// types/formStructure -- asi que solo hay dos secciones, no las tres de StylesPanel. El
// abierto/cerrado lo lleva la barra que lo contiene.
export function RowStylesMenu({ rowId, styles, isOpen, onToggle, onClose }: RowStylesMenuProps) {
  const updateRowStyles = useFormStore((state) => state.updateRowStyles);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, onClose, isOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        title="Estilos de la fila"
        className={ROW_TOOLBAR_ICON_ITEM_CLASSES}
      >
        <Palette size={12} />
      </button>
      {isOpen && (
        <div className={`${ROW_TOOLBAR_POPOVER_CLASSES} gap-3`}>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`row-css-${rowId}`}>CSS personalizado</Label>
            <Textarea
              id={`row-css-${rowId}`}
              aria-label="CSS personalizado de la fila"
              value={styles?.customCss ?? ""}
              onChange={(event) => updateRowStyles(rowId, { customCss: event.target.value })}
              placeholder={"background: #f8fafc;\nborder-radius: 8px;"}
              spellCheck={false}
              rows={3}
              variant="code"
            />
            <CssValidationHint text={styles?.customCss ?? ""} />
          </div>

          <TwoColumnFieldGroup legend="Márgenes">
            <PxInput
              id={`row-margin-top-${rowId}`}
              label="Superior"
              value={styles?.marginTop ?? ""}
              onChange={(value) => updateRowStyles(rowId, { marginTop: value })}
            />
            <PxInput
              id={`row-margin-bottom-${rowId}`}
              label="Inferior"
              value={styles?.marginBottom ?? ""}
              onChange={(value) => updateRowStyles(rowId, { marginBottom: value })}
            />
          </TwoColumnFieldGroup>
        </div>
      )}
    </div>
  );
}
