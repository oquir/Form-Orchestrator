import type { IconComponent } from "reicon-react";
import { Moon, Sun } from "reicon-react";
import type { SidebarTab } from "../../store/formStore";

interface SidebarTabRailProps {
  tabs: { id: SidebarTab; label: string; icon: IconComponent }[];
  activeTab: SidebarTab;
  onSelect: (tab: SidebarTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SidebarTabRail({
  tabs,
  activeTab,
  onSelect,
  isDarkMode,
  onToggleDarkMode,
}: SidebarTabRailProps) {
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-3 dark:border-slate-800 dark:bg-slate-900">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            title={tab.label}
            aria-label={tab.label}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:cursor-pointer ${
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}

      <button
        type="button"
        onClick={onToggleDarkMode}
        title={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
        aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
        className="mt-auto flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
}
