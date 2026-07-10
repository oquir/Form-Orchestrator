import type { ReactNode } from "react";
import { useFormStore } from "../../store/formStore";

interface AppLayoutProps {
  sidebar: ReactNode;
  canvas: ReactNode;
}

export function AppLayout({ sidebar, canvas }: AppLayoutProps) {
  const isSidebarOpen = useFormStore((state) => state.isSidebarOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <aside
        className={`relative flex shrink-0 flex-col h-full overflow-hidden bg-white transition-all duration-300 ease-in-out border-r border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 ${
          isSidebarOpen ? "w-80 shadow-sm" : "w-14"
        }`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-100 relative dark:bg-neutral-950">
        {canvas}
      </main>
    </div>
  );
}
