import type { IconComponent } from "reicon-react";
import type { SidebarTab } from "../../../types/storeTypes";

export interface SidebarTabRailProps {
  tabs: { id: SidebarTab; label: string; icon: IconComponent }[];
  activeTab: SidebarTab;
  onSelect: (tab: SidebarTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}
