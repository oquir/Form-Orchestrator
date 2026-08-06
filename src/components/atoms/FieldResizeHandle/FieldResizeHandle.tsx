import { useFieldResize } from "../../../hooks/useFieldResize/useFieldResize";
import type { FieldResizeHandleVariantProps } from "../../../types/fieldResize";
import { FieldResizeHandleBar } from "../FieldResizeHandleBar/FieldResizeHandleBar";
import { FieldResizeHandleKnob } from "../FieldResizeHandleKnob/FieldResizeHandleKnob";
import type { FieldResizeHandleProps } from "./FieldResizeHandle.types";

export function FieldResizeHandle({
  colSpan,
  rowColumns,
  maxSpan,
  onResize,
}: FieldResizeHandleProps) {
  const { isResizing, handlePointerDown } = useFieldResize({
    colSpan,
    rowColumns,
    maxSpan,
    onResize,
  });

  // En un campo angosto el tirador redondo lo tapa entero, asi que se cae a una barra.
  const isCompact: boolean = rowColumns / colSpan >= 8;
  const handleProps: FieldResizeHandleVariantProps = {
    isResizing,
    title: `Redimensionar (${colSpan}/${rowColumns})`,
    onPointerDown: handlePointerDown,
  };

  return isCompact ? (
    <FieldResizeHandleBar {...handleProps} />
  ) : (
    <FieldResizeHandleKnob {...handleProps} />
  );
}
