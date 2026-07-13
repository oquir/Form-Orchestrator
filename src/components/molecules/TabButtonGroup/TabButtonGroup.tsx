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
        const isDanger = item.variant === "danger";
        const activeClasses = isDanger
          ? "bg-red-600 text-white dark:bg-red-500"
          : "bg-orange-600 text-white dark:bg-orange-500 dark:text-white";
        const inactiveClasses = isDanger
          ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 hover:cursor-pointer"
          : "text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800 hover:cursor-pointer";
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onSelect(item.tab)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              isActive ? activeClasses : inactiveClasses
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
