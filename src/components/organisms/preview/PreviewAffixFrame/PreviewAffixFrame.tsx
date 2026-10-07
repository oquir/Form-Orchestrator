import {
  AFFIX_CLASSES,
  AFFIX_INPUT_CLASSES,
  FRAME_BASE_CLASSES,
  FRAME_IDLE_CLASSES,
  FRAME_INVALID_CLASSES,
} from "./PreviewAffixFrame.constants";
import type { PreviewAffixFrameProps } from "./PreviewAffixFrame.types";

export function PreviewAffixFrame({ prefix, suffix, invalid, children }: PreviewAffixFrameProps) {
  return (
    <div
      className={`${FRAME_BASE_CLASSES} ${invalid ? FRAME_INVALID_CLASSES : FRAME_IDLE_CLASSES}`}
    >
      {prefix && <span className={AFFIX_CLASSES}>{prefix}</span>}
      {children(AFFIX_INPUT_CLASSES)}
      {suffix && <span className={AFFIX_CLASSES}>{suffix}</span>}
    </div>
  );
}
