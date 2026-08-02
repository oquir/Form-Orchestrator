import type { ComponentType } from "react";
import type { CanvasField } from "../../../../types/field";
import type { IconProps } from "../../../../types/icon";

export interface FieldTooltipEditorProps {
  field: CanvasField;
}

export interface TooltipPositionOption {
  label: string;
  icon: ComponentType<IconProps>;
}
