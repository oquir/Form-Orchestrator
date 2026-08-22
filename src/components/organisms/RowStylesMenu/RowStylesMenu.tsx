import { useRef, useState } from "react";
import { Palette } from "reicon-react";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
import { useFormStore } from "../../../store/formStore";
import { Input } from "../../atoms/Input/Input";
import { Label } from "../../atoms/Label/Label";
import { TwoColumnFieldGroup } from "../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { PxInput } from "../../molecules/PxInput/PxInput";
import type { RowStylesMenuProps } from "./RowStylesMenu.types";

// Mismo icono que la pestaña "Estilos" de un campo (Sidebar.constants): es el mismo concepto, un
// nivel mas arriba. A proposito no ofrece color de fondo ni de texto -- ver el comentario en
// types/formStructure -- asi que solo hay dos secciones, no las tres de StylesPanel.
export function RowStylesMenu({ rowId, styles }: RowStylesMenuProps) {
  const updateRowStyles = useFormStore((state) => state.updateRowStyles);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  return (
    <div ref={containerRef} className="absolute top-1/2 -right-3 -translate-y-1/2 z-10">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        title="Estilos de la fila"
        className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:cursor-pointer hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:border-orange-500 dark:hover:text-orange-400"
      >
        <Palette size={12} />
      </button>
      {isOpen && (
        <div className="absolute bottom-6 left-0 flex w-72 flex-col gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`row-classes-${rowId}`}>Clases CSS (Tailwind)</Label>
            <Input
              id={`row-classes-${rowId}`}
              aria-label="Clases CSS de Tailwind para la fila"
              value={styles?.customClasses ?? ""}
              onChange={(event) => updateRowStyles(rowId, { customClasses: event.target.value })}
              placeholder="bg-slate-50 rounded-lg"
              spellCheck={false}
              tone="code"
            />
          </div>

          <TwoColumnFieldGroup legend="Márgenes">
            <PxInput
              id={`row-margin-top-${rowId}`}
              label="Superior"
              value={styles?.marginTop ?? ""}
              onChange={(value) => updateRowStyles(rowId, { marginTop: value })}
            />
            <PxInput
              id={`row-margin-bottom-${rowId}`}
              label="Inferior"
              value={styles?.marginBottom ?? ""}
              onChange={(value) => updateRowStyles(rowId, { marginBottom: value })}
            />
          </TwoColumnFieldGroup>
        </div>
      )}
    </div>
  );
}
