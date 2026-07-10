import { useEffect, useState } from "react";
import type { SidebarTab } from "../../store/formStore";
import { findFieldById, getActiveRows, useFormStore } from "../../store/formStore";
import { IconButton } from "../atoms/IconButton";
import { SaveFieldForm } from "../molecules/SaveFieldForm";
import { TabButtonGroup } from "../molecules/TabButtonGroup";
import { AttributesPanel } from "./panels/AttributesPanel";
import { LogicPanel } from "./panels/LogicPanel";
import { StylesPanel } from "./panels/StylesPanel";
import { ValidationsPanel } from "./panels/ValidationsPanel";

export interface FieldContextMenuState {
  fieldId: string;
  x: number;
  y: number;
}

const CONTEXT_MENU_TABS: { tab: SidebarTab; label: string }[] = [
  { tab: "styles", label: "Estilos" },
  { tab: "attributes", label: "Atributos" },
  { tab: "validations", label: "Validaciones" },
  { tab: "logic", label: "Lógica" },
];

export function FieldContextMenu({
  menu,
  onClose,
}: {
  menu: FieldContextMenuState;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("styles");
  const activeRows = useFormStore(getActiveRows);
  const field = findFieldById(activeRows, menu.fieldId);

  useEffect(() => {
    const handlePointerDown = () => onClose();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!field) return null;

  const menuWidth = 320;
  const menuHeight = 460;
  const left = Math.min(menu.x, window.innerWidth - menuWidth - 8);
  const top = Math.min(menu.y, window.innerHeight - menuHeight - 8);

  return (
    <div
      style={{ left: Math.max(8, left), top: Math.max(8, top), width: menuWidth }}
      className="fixed z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-neutral-800">
        <p className="truncate text-xs font-semibold text-slate-700 dark:text-neutral-200">
          {field.label}
        </p>
        <IconButton
          onClick={onClose}
          className="shrink-0 text-slate-300 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-300"
          aria-label="Cerrar"
        >
          ×
        </IconButton>
      </div>

      <TabButtonGroup tabs={CONTEXT_MENU_TABS} activeTab={activeTab} onSelect={setActiveTab} />

      <div className="overflow-y-auto p-3">
        {activeTab === "attributes" && <AttributesPanel field={field} />}
        {activeTab === "validations" && <ValidationsPanel field={field} />}
        {activeTab === "styles" && <StylesPanel field={field} />}
        {activeTab === "logic" && <LogicPanel field={field} />}
      </div>

      <SaveFieldForm
        fieldId={field.id}
        label="Guardar en el Almacén de Partes"
        containerClassName="border-t border-slate-100 p-3 dark:border-neutral-800"
        showSuccessMessage
      />
    </div>
  );
}
