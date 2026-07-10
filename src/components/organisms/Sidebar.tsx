import type { IconComponent } from "reicon-react";
import { Archive, CheckCircle, Code, Layers, Palette, Sliders } from "reicon-react";
import type { SidebarTab } from "../../store/formStore";
import { findFieldById, getActiveRows, useFormStore } from "../../store/formStore";
import { PanelHeader } from "../molecules/PanelHeader";
import { SidebarTabRail } from "../molecules/SidebarTabRail";
import { FieldPalette } from "./FieldPalette";
import { AttributesPanel } from "./panels/AttributesPanel";
import { LibraryPanel } from "./panels/LibraryPanel";
import { LogicPanel } from "./panels/LogicPanel";
import { StylesPanel } from "./panels/StylesPanel";
import { ValidationsPanel } from "./panels/ValidationsPanel";

const TABS: { id: SidebarTab; label: string; icon: IconComponent }[] = [
  { id: "fields", label: "Campos", icon: Layers },
  { id: "attributes", label: "Atributos", icon: Sliders },
  { id: "validations", label: "Validaciones", icon: CheckCircle },
  { id: "styles", label: "Estilos", icon: Palette },
  { id: "logic", label: "Lógica", icon: Code },
  { id: "library", label: "Almacén", icon: Archive },
];

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
