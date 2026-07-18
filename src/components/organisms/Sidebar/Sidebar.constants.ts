import { Archive, CheckCircle, Code, Layers, Palette, Sliders } from "reicon-react";
import type { SidebarTabItem } from "./Sidebar.types";

export const TABS: SidebarTabItem[] = [
  { id: "fields", label: "Campos", icon: Layers },
  { id: "attributes", label: "Atributos", icon: Sliders },
  { id: "validations", label: "Validaciones", icon: CheckCircle },
  { id: "styles", label: "Estilos", icon: Palette },
  { id: "logic", label: "Lógica", icon: Code },
  { id: "library", label: "Almacén", icon: Archive },
];
