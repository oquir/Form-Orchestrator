import type { TabButtonGroupItem } from "../../molecules/TabButtonGroup/TabButtonGroup.types";

export type ContextMenuTab = "attributes" | "styles" | "validations" | "logic" | "delete";

export const CONTEXT_MENU_TABS: TabButtonGroupItem<ContextMenuTab>[] = [
  { tab: "attributes", label: "Atributos" },
  { tab: "styles", label: "Estilos" },
  { tab: "validations", label: "Validaciones" },
  { tab: "logic", label: "Lógica" },
  { tab: "delete", label: "Borrar", variant: "danger" },
];
