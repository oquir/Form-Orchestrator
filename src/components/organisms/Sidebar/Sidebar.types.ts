import type { IconComponent } from "reicon-react";
import type { SidebarTab } from "../../../types/storeTypes";

export interface SidebarTabItem {
  id: SidebarTab;
  label: string;
  icon: IconComponent;
}
