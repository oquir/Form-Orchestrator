import type { TabButtonGroupItem } from "../../../types/tabButtonGroup";

export interface TabButtonGroupProps<T extends string> {
  tabs: TabButtonGroupItem<T>[];
  activeTab: T;
  onSelect: (tab: T) => void;
}
