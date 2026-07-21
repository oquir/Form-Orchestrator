import type { TabButtonGroupItem } from "../../../types/tabButtonGroup";
import type { CanvasViewMode } from "./Canvas.types";

export const VIEW_MODE_TABS: TabButtonGroupItem<CanvasViewMode>[] = [
  { tab: "canvas", label: "Lienzo" },
  { tab: "json", label: "JSON" },
  { tab: "payload", label: "Payload" },
];
