import { CATALOG_DEPARTAMENTOS, CATALOG_MUNICIPIOS } from "../../constants/catalog";
import type { FieldOption } from "../../types/field";

export const MOCK_OPTION_COUNT = 3;

// Subconjunto con codigos DANE reales: basta para ver el filtrado funcionando de verdad.
const MUNICIPIOS_POR_DEPARTAMENTO: Record<string, FieldOption[]> = {
  "05": [
    { id: "05001", label: "Medellín" },
    { id: "05088", label: "Bello" },
    { id: "05360", label: "Itagüí" },
    { id: "05266", label: "Envigado" },
  ],
  "08": [
    { id: "08001", label: "Barranquilla" },
    { id: "08758", label: "Soledad" },
    { id: "08433", label: "Malambo" },
  ],
  "11": [{ id: "11001", label: "Bogotá D.C." }],
  "13": [
    { id: "13001", label: "Cartagena" },
    { id: "13430", label: "Magangué" },
  ],
  "68": [
    { id: "68001", label: "Bucaramanga" },
    { id: "68276", label: "Floridablanca" },
    { id: "68307", label: "Girón" },
  ],
  "76": [
    { id: "76001", label: "Cali" },
    { id: "76520", label: "Palmira" },
    { id: "76109", label: "Buenaventura" },
  ],
};

const DEPARTAMENTOS: FieldOption[] = [
  { id: "05", label: "Antioquia" },
  { id: "08", label: "Atlántico" },
  { id: "11", label: "Bogotá D.C." },
  { id: "13", label: "Bolívar" },
  { id: "68", label: "Santander" },
  { id: "76", label: "Valle del Cauca" },
];

export const MOCK_CATALOGS: Record<string, (parent?: string) => FieldOption[]> = {
  [CATALOG_DEPARTAMENTOS]: () => DEPARTAMENTOS,
  [CATALOG_MUNICIPIOS]: (parent) => (parent ? (MUNICIPIOS_POR_DEPARTAMENTO[parent] ?? []) : []),
};
