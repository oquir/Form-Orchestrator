import { useFormStore } from "../../store/formStore";
import type { AppLayoutProps } from "./AppLayout.types";

export function AppLayout({ sidebar, canvas, rightSidebar }: AppLayoutProps) {
  const isSidebarOpen: boolean = useFormStore((state) => state.isSidebarOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <aside
        className={`relative flex shrink-0 flex-col h-full overflow-hidden bg-white transition-all ease-in-out border-r border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 ${
          isSidebarOpen ? "w-80 shadow-sm" : "w-14"
        }`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </div>
      </aside>

      <main
        data-canvas-scroll
        className="flex-1 overflow-auto bg-slate-100 relative dark:bg-neutral-950"
      >
        {canvas}
      </main>

      {/* A diferencia del izquierdo, este no se pliega: el ancho es fijo y son sus dos pestañas las
          que cambian el contenido. Por eso no necesita el molde de hijo w-80 recortado. */}
      <aside className="relative flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {rightSidebar}
      </aside>
    </div>
  );
}
