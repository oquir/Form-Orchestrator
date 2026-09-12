import {
  Calendar,
  CheckCircle,
  Code,
  Database,
  Layers,
  Link,
  Palette,
  Sliders,
} from "reicon-react";
import type { SidebarTab } from "../../../types/ui";
import type { SidebarTabItem } from "./Sidebar.types";

export const TABS: SidebarTabItem[] = [
  { id: "fields", label: "Campos", icon: Layers },
  { id: "attributes", label: "Atributos", icon: Sliders },
  { id: "validations", label: "Validaciones", icon: CheckCircle },
  { id: "styles", label: "Estilos", icon: Palette },
  { id: "logic", label: "Lógica", icon: Code },
  { id: "apiMapping", label: "Mapeo API", icon: Link },
  { id: "catalogs", label: "Catálogos", icon: Database },
  { id: "fechas", label: "Fechas", icon: Calendar },
];

// Las pestanas que editan el campo seleccionado, a diferencia de Campos, Catalogos y Fechas.
export const FIELD_TABS: SidebarTab[] = [
  "attributes",
  "validations",
  "styles",
  "logic",
  "apiMapping",
];
