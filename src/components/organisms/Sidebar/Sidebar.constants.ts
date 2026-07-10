import type { IconComponent } from "reicon-react";
import { Archive, CheckCircle, Code, Layers, Palette, Sliders } from "reicon-react";
import type { SidebarTab } from "../../../types/storeTypes";

export const TABS: { id: SidebarTab; label: string; icon: IconComponent }[] = [
  { id: "fields", label: "Campos", icon: Layers },
  { id: "attributes", label: "Atributos", icon: Sliders },
  { id: "validations", label: "Validaciones", icon: CheckCircle },
  { id: "styles", label: "Estilos", icon: Palette },
  { id: "logic", label: "Lógica", icon: Code },
  { id: "library", label: "Almacén", icon: Archive },
];
