import type { TabButtonGroupItem } from "../../../../types/tabButtonGroup";

export type ResultTab = "payload" | "values" | "errors";

export const RESULT_TABS: TabButtonGroupItem<ResultTab>[] = [
  { tab: "payload", label: "Payload" },
  { tab: "values", label: "Valores" },
  { tab: "errors", label: "Errores" },
];
