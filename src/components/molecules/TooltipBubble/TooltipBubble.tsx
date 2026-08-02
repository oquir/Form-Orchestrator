import {
  TOOLTIP_ANCHOR_CLASSES,
  TOOLTIP_SURFACE_CLASSES,
  TOOLTIP_TEXT_CLASSES,
} from "../../../constants/fieldTooltip";
import { RichTextView } from "../../atoms/RichTextView/RichTextView";
import { TOOLTIP_BUBBLE_CLASSES } from "./TooltipBubble.constants";
import type { TooltipBubbleProps } from "./TooltipBubble.types";

export function TooltipBubble({ tooltip }: TooltipBubbleProps) {
  return (
    <div
      className={`${TOOLTIP_BUBBLE_CLASSES} ${TOOLTIP_ANCHOR_CLASSES[tooltip.position]} ${TOOLTIP_SURFACE_CLASSES} ${
        tooltip.customClasses ?? ""
      }`}
    >
      <RichTextView content={tooltip.content} className={TOOLTIP_TEXT_CLASSES} />
    </div>
  );
}
