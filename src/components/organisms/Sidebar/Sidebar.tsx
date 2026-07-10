import { findFieldById, getActiveRows, useFormStore } from "../../../store/formStore";
import { PanelHeader } from "../../molecules/PanelHeader/PanelHeader";
import { SidebarTabRail } from "../../molecules/SidebarTabRail/SidebarTabRail";
import { FieldPalette } from "../FieldPalette/FieldPalette";
import { AttributesPanel } from "../panels/AttributesPanel/AttributesPanel";
import { LibraryPanel } from "../panels/LibraryPanel/LibraryPanel";
import { LogicPanel } from "../panels/LogicPanel/LogicPanel";
import { StylesPanel } from "../panels/StylesPanel/StylesPanel";
import { ValidationsPanel } from "../panels/ValidationsPanel/ValidationsPanel";
import { TABS } from "./Sidebar.constants";

export function Sidebar() {
  const activeTab = useFormStore((state) => state.sidebarTab);
  const setActiveTab = useFormStore((state) => state.setSidebarTab);
  const rows = useFormStore(getActiveRows);
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const selectedField = findFieldById(rows, selectedFieldId);
  const activeTabDef = TABS.find((tab) => tab.id === activeTab);
  const isDarkMode = useFormStore((state) => state.isDarkMode);
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode);
  const isSidebarOpen = useFormStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useFormStore((state) => state.setSidebarOpen);

  return (
    <div className="flex h-full">
      <SidebarTabRail
        tabs={TABS}
        activeTab={activeTab}
        onSelect={(tab) => {
          if (isSidebarOpen && tab === activeTab) {
            setSidebarOpen(false);
            return;
          }
          setActiveTab(tab);
          setSidebarOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PanelHeader
          title={activeTabDef?.label ?? ""}
          subtitle={
            selectedField
              ? `Editando: ${selectedField.label}`
              : "Selecciona un campo en el lienzo para editarlo"
          }
        />

        <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-400 dark:text-neutral-500">
          {activeTab === "fields" && <FieldPalette />}
          {activeTab !== "fields" && activeTab !== "library" && !selectedField && (
            <p>Sin campo seleccionado.</p>
          )}
          {selectedField && activeTab === "attributes" && <AttributesPanel field={selectedField} />}
          {selectedField && activeTab === "validations" && (
            <ValidationsPanel field={selectedField} />
          )}
          {selectedField && activeTab === "styles" && <StylesPanel field={selectedField} />}
          {selectedField && activeTab === "logic" && <LogicPanel field={selectedField} />}
          {activeTab === "library" && <LibraryPanel selectedField={selectedField} />}
        </div>
      </div>
    </div>
  );
}
