export interface TabButtonGroupItem<T extends string> {
  tab: T;
  label: string;
  variant?: "default" | "danger";
}

export interface TabButtonGroupProps<T extends string> {
  tabs: TabButtonGroupItem<T>[];
  activeTab: T;
  onSelect: (tab: T) => void;
}
