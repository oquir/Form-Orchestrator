import type { CSSProperties, RefObject } from "react";

export interface CanvasZoomReturn {
  contentRef: RefObject<HTMLDivElement | null>;
  contentStyle: CSSProperties;
}
