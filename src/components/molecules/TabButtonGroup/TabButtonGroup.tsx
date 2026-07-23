import { TAB_BASE_CLASSES, TAB_VARIANT_CLASSES } from "./TabButtonGroup.constants";
import type { TabButtonGroupProps } from "./TabButtonGroup.types";

export function TabButtonGroup<T extends string>({
  tabs,
  activeTab,
  onSelect,
}: TabButtonGroupProps<T>) {
  return (
    <nav className="flex gap-1 border-b border-slate-100 px-2 py-1.5 dark:border-neutral-800">
      {tabs.map((item) => {
        const isActive = activeTab === item.tab;
        const variantClasses = TAB_VARIANT_CLASSES[item.variant ?? "default"];
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onSelect(item.tab)}
            className={`${TAB_BASE_CLASSES} ${isActive ? variantClasses.active : variantClasses.inactive}`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
