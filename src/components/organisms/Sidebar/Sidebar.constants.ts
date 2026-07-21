import { Archive, CheckCircle, Code, Layers, Link, Palette, Sliders } from "reicon-react";
import type { SidebarTabItem } from "./Sidebar.types";

export const TABS: SidebarTabItem[] = [
  { id: "fields", label: "Campos", icon: Layers },
  { id: "attributes", label: "Atributos", icon: Sliders },
  { id: "validations", label: "Validaciones", icon: CheckCircle },
  { id: "styles", label: "Estilos", icon: Palette },
  { id: "logic", label: "Lógica", icon: Code },
  { id: "apiMapping", label: "Mapeo API", icon: Link },
  { id: "library", label: "Almacén", icon: Archive },
];
