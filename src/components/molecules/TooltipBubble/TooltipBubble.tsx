import { RichTextView } from "../../atoms/RichTextView/RichTextView";
import {
  TOOLTIP_ANCHOR_CLASSES,
  TOOLTIP_BUBBLE_CLASSES,
  TOOLTIP_TEXT_CLASSES,
} from "./TooltipBubble.constants";
import type { TooltipBubbleProps } from "./TooltipBubble.types";

export function TooltipBubble({ tooltip }: TooltipBubbleProps) {
  return (
    <div
      className={`${TOOLTIP_BUBBLE_CLASSES} ${TOOLTIP_ANCHOR_CLASSES[tooltip.position]} ${
        tooltip.customClasses ?? ""
      }`}
    >
      <RichTextView content={tooltip.content} className={TOOLTIP_TEXT_CLASSES} />
    </div>
  );
}
