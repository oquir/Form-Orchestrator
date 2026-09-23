import { useFormStore } from "../../store/formStore";
import type { AppLayoutProps } from "./AppLayout.types";

export function AppLayout({ sidebar, canvas, canvasOverlay, rightSidebar }: AppLayoutProps) {
  const isSidebarOpen: boolean = useFormStore((state) => state.isSidebarOpen);
  const isRightSidebarOpen: boolean = useFormStore((state) => state.isRightSidebarOpen);

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

      {/* La capa flotante va al lado de main y no adentro: asi no se desplaza con el scroll ni se
          escala con el zoom. scrollbar-gutter estable porque el lienzo dimensiona su raiz con el
          ancho del puerto: si la barra vertical apareciera y desapareciera, ese ancho oscilaria.
          Con el panel derecho plegado este envoltorio llega hasta el borde de la ventana, que es lo
          que deja al chip en la esquina de la pantalla y no dentro del lienzo. */}
      <div className="relative flex min-w-0 flex-1">
        <main
          data-canvas-scroll
          className="relative flex-1 overflow-auto bg-slate-100 bg-dot-grid scrollbar-gutter-stable dark:bg-neutral-950"
        >
          {canvas}
        </main>
        {canvasOverlay}
      </div>

      {/* Plegado se va entero y no a ancho cero: un aside de 0 px dejaria su border-l como una linea
          sin panel detras, y sobre todo mantendria montado CanvasTabs, cuyas pestañas son zonas de
          soltar -- invisibles pero vivas. Plegado lo reemplaza CollapsedRightSidebar desde la capa
          flotante. Tampoco anima el ancho: no es el mismo objeto encogiendose sino otro distinto, y
          cada frame de esa animacion dispararia el ResizeObserver del puerto. Por lo mismo no
          necesita el molde de hijo w-80 recortado del izquierdo, que existe alla porque su riel de
          56 px sigue a la vista y su contenido no puede desmontarse. */}
      {isRightSidebarOpen && (
        <aside className="animate-right-panel-in relative flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {rightSidebar}
        </aside>
      )}
    </div>
  );
}
