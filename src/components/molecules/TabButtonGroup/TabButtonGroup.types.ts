import type { SidebarTab } from "../../../types/storeTypes";

export interface TabButtonGroupProps {
  tabs: { tab: SidebarTab; label: string }[];
  activeTab: SidebarTab;
  onSelect: (tab: SidebarTab) => void;
}
