import { Xmark } from "reicon-react";
import { useFieldContextMenu } from "../../../hooks/useFieldContextMenu/useFieldContextMenu";
import type { FieldContextMenuState } from "../../../types/fieldContextMenu";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { SaveFieldForm } from "../../molecules/SaveFieldForm/SaveFieldForm";
import { TabButtonGroup } from "../../molecules/TabButtonGroup/TabButtonGroup";
import { AttributesPanel } from "../panels/AttributesPanel/AttributesPanel";
import { LogicPanel } from "../panels/LogicPanel/LogicPanel";
import { StylesPanel } from "../panels/StylesPanel/StylesPanel";
import { ValidationsPanel } from "../panels/ValidationsPanel/ValidationsPanel";
import { CONTEXT_MENU_TABS } from "./FieldContextMenu.constants";

export function FieldContextMenu({
  menu,
  onClose,
}: {
  menu: FieldContextMenuState;
  onClose: () => void;
}) {
  const { field, activeTab, handleSelectTab, position } = useFieldContextMenu({ menu, onClose });

  if (!field) return null;

  return (
    <div
      style={{ left: position.left, top: position.top, width: position.width }}
      className="fixed z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-neutral-800">
        <p className="truncate text-xs font-semibold text-slate-700 dark:text-neutral-200">
          {field.label}
        </p>
        <IconButton
          onClick={onClose}
          className="shrink-0 text-slate-300 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-300 hover:cursor-pointer"
          aria-label="Cerrar"
        >
          <Xmark size={18} weight="Filled" />
        </IconButton>
      </div>

      <TabButtonGroup tabs={CONTEXT_MENU_TABS} activeTab={activeTab} onSelect={handleSelectTab} />

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
