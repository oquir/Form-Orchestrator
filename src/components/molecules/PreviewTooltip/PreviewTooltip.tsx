import { useState } from "react";
import { InfoCircle } from "reicon-react";
import {
  TOOLTIP_ANCHOR_CLASSES,
  TOOLTIP_SURFACE_CLASSES,
  TOOLTIP_TEXT_CLASSES,
} from "../../../constants/fieldTooltip";
import { RichTextView } from "../../atoms/RichTextView/RichTextView";
import type { PreviewTooltipProps } from "./PreviewTooltip.types";

export function PreviewTooltip({ tooltip, label }: PreviewTooltipProps) {
  const [pinned, setPinned] = useState<boolean>(false);

  return (
    <span className="relative inline-flex group/tip">
      <button
        type="button"
        aria-label={`Ayuda sobre ${label}`}
        aria-expanded={pinned}
        onClick={() => setPinned((open) => !open)}
        onBlur={() => setPinned(false)}
        className="flex items-center text-fg-subtle hover:cursor-pointer hover:text-brand-fg"
      >
        <InfoCircle size={13} />
      </button>

      <span
        className={`absolute z-30 ${pinned ? "block" : "hidden group-hover/tip:block"} ${
          TOOLTIP_ANCHOR_CLASSES[tooltip.position]
        } ${TOOLTIP_SURFACE_CLASSES} ${tooltip.customClasses ?? ""}`}
      >
        <RichTextView content={tooltip.content} className={TOOLTIP_TEXT_CLASSES} />
      </span>
    </span>
  );
}
