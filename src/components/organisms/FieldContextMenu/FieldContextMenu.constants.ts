import type { TabButtonGroupItem } from "../../../types/tabButtonGroup";
import type { ContextMenuTab } from "./FieldContextMenu.types";

export const CONTEXT_MENU_TABS: TabButtonGroupItem<ContextMenuTab>[] = [
  { tab: "attributes", label: "Atributos" },
  { tab: "styles", label: "Estilos" },
  { tab: "validations", label: "Validaciones" },
  { tab: "logic", label: "Lógica" },
  { tab: "delete", label: "Borrar", variant: "danger" },
];
