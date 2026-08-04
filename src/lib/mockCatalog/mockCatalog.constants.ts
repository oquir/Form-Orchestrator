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

// Catalogos que el JSON todavia no declara: el simulador los reconoce por la hoja del payload a la
// que el campo esta mapeado. Vive solo aca, el contrato no cambia. Los ids importan — son los que
// las condiciones de la plantilla comparan: sin un "2" real, persona juridica era inalcanzable.
export const MOCK_BY_LEAF: Record<string, FieldOption[]> = {
  idTipoDocumento: [
    { id: "1", label: "Cédula de ciudadanía" },
    { id: "2", label: "NIT" },
    { id: "3", label: "Cédula de extranjería" },
    { id: "4", label: "Pasaporte" },
    { id: "5", label: "Tarjeta de identidad" },
  ],
  periodoAnio: [
    { id: "2026", label: "2026" },
    { id: "2025", label: "2025" },
    { id: "2024", label: "2024" },
    { id: "2023", label: "2023" },
  ],
  idPeriodoAnual: [
    { id: "1", label: "Anual" },
    { id: "2", label: "Primer semestre" },
    { id: "3", label: "Segundo semestre" },
  ],
  idTipoDeclaracion: [
    { id: "1", label: "Inicial" },
    { id: "2", label: "Corrección" },
  ],
  idClasificacionMunicipio: [
    { id: "1", label: "Régimen común" },
    { id: "2", label: "Régimen simplificado" },
    { id: "3", label: "Gran contribuyente" },
    { id: "4", label: "Autorretenedor" },
  ],
  idTipoRepresentante: [
    { id: "1", label: "Representante legal" },
    { id: "2", label: "Apoderado" },
    { id: "3", label: "Revisor fiscal" },
  ],
  // Codigos CIIU rev. 4 A.C. reales, que es lo que el contribuyente reconoce.
  idActividad: [
    { id: "4711", label: "4711 · Comercio al por menor en establecimientos no especializados" },
    { id: "4772", label: "4772 · Comercio al por menor de otros productos nuevos" },
    { id: "4530", label: "4530 · Comercio de partes y accesorios para vehículos" },
    { id: "5611", label: "5611 · Expendio a la mesa de comidas preparadas" },
    { id: "6201", label: "6201 · Actividades de desarrollo de sistemas informáticos" },
    { id: "6810", label: "6810 · Actividades inmobiliarias con bienes propios o arrendados" },
  ],
};
