import type { SidebarTab } from "../../store/formStore";

interface TabButtonGroupProps {
  tabs: { tab: SidebarTab; label: string }[];
  activeTab: SidebarTab;
  onSelect: (tab: SidebarTab) => void;
}

export function TabButtonGroup({ tabs, activeTab, onSelect }: TabButtonGroupProps) {
  return (
    <nav className="flex gap-1 border-b border-slate-100 px-2 py-1.5 dark:border-slate-800">
      {tabs.map((item) => (
        <button
          key={item.tab}
          type="button"
          onClick={() => onSelect(item.tab)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            activeTab === item.tab
              ? "bg-orange-600 text-white dark:bg-orange-500 dark:text-white"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
