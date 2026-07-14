export interface TabButtonGroupItem<T extends string> {
  tab: T;
  label: string;
  variant?: "default" | "danger";
}
