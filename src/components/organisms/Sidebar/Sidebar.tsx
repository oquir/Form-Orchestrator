import {
  findFieldById,
  getActiveRows,
  getAllFields,
  getSelectedFieldId,
  useFormStore,
} from "../../../store/formStore";
import { PanelHeader } from "../../atoms/PanelHeader/PanelHeader";
import { SelectionSummary } from "../../molecules/SelectionSummary/SelectionSummary";
import { SidebarTabRail } from "../../molecules/SidebarTabRail/SidebarTabRail";
import { FieldPalette } from "../FieldPalette/FieldPalette";
import { ApiMappingPanel } from "../panels/ApiMappingPanel/ApiMappingPanel";
import { AttributesPanel } from "../panels/AttributesPanel/AttributesPanel";
import { CatalogsPanel } from "../panels/CatalogsPanel/CatalogsPanel";
import { FormScriptEditor } from "../panels/FormScriptEditor/FormScriptEditor";
import { LogicPanel } from "../panels/LogicPanel/LogicPanel";
import { MaxDatesPanel } from "../panels/MaxDatesPanel/MaxDatesPanel";
import { StylesPanel } from "../panels/StylesPanel/StylesPanel";
import { ValidationsPanel } from "../panels/ValidationsPanel/ValidationsPanel";
import { FIELD_TABS, TABS } from "./Sidebar.constants";

export function Sidebar() {
  const activeTab = useFormStore((state) => state.sidebarTab);
  const setActiveTab = useFormStore((state) => state.setSidebarTab);
  const rows = useFormStore(getActiveRows);
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds);
  const selectedFieldId = useFormStore(getSelectedFieldId);
  const selectedField = findFieldById(rows, selectedFieldId);
  const activeTabDef = TABS.find((tab) => tab.id === activeTab);
  const isDarkMode = useFormStore((state) => state.isDarkMode);
  const toggleDarkMode = useFormStore((state) => state.toggleDarkMode);
  const isSidebarOpen = useFormStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useFormStore((state) => state.setSidebarOpen);
  // Con varios seleccionados las pestanas de campo no tienen a quien editar, y la de Logica no debe
  // caer al preludio como si no hubiera nada seleccionado.
  const isMultiSelection: boolean = selectedFieldIds.length > 1;
  const isFieldTab: boolean = FIELD_TABS.includes(activeTab);

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

      <section
        aria-label={activeTabDef?.label ?? "Panel de edición"}
        className="flex min-w-0 flex-1 flex-col"
      >
        <PanelHeader
          title={activeTabDef?.label ?? ""}
          subtitle={
            activeTab === "fields" ? (
              "Arrastra un campo al lienzo"
            ) : isMultiSelection && isFieldTab ? (
              `${selectedFieldIds.length} campos seleccionados`
            ) : selectedField ? (
              <>
                Editando <code className="font-mono text-fg-muted">{selectedField.name}</code>
              </>
            ) : activeTab === "logic" ? (
              "Sin campo seleccionado: funciones compartidas por todos los scripts"
            ) : (
              "Selecciona un campo en el lienzo para editarlo"
            )
          }
        />

        <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-400 dark:text-neutral-500">
          {activeTab === "fields" && <FieldPalette />}
          {isMultiSelection && isFieldTab && (
            <SelectionSummary
              fields={getAllFields(rows).filter((field) => selectedFieldIds.includes(field.id))}
            />
          )}
          {activeTab !== "fields" &&
            activeTab !== "catalogs" &&
            activeTab !== "fechas" &&
            activeTab !== "logic" &&
            !selectedField &&
            !isMultiSelection && <p>Sin campo seleccionado.</p>}
          {selectedField && activeTab === "attributes" && <AttributesPanel field={selectedField} />}
          {selectedField && activeTab === "validations" && (
            <ValidationsPanel field={selectedField} />
          )}
          {selectedField && activeTab === "styles" && <StylesPanel field={selectedField} />}
          {/* Con campo, el script de ese campo; sin campo, el del formulario. Es la misma
              convencion que ya usan las pestañas que funcionan sin seleccion. */}
          {activeTab === "logic" &&
            !isMultiSelection &&
            (selectedField ? <LogicPanel field={selectedField} /> : <FormScriptEditor />)}
          {selectedField && activeTab === "apiMapping" && <ApiMappingPanel field={selectedField} />}
          {activeTab === "catalogs" && <CatalogsPanel />}
          {activeTab === "fechas" && <MaxDatesPanel />}
        </div>
      </section>
    </div>
  );
}
