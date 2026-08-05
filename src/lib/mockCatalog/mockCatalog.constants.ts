import {
  CATALOG_ACTIVIDADES,
  CATALOG_DEPARTAMENTOS,
  CATALOG_JUEGOS_PERMITIDOS,
  CATALOG_MUNICIPIOS,
  CATALOG_PERIODOS_ANUALES,
  CATALOG_TIPOS_DECLARACION,
  CATALOG_TIPOS_DOCUMENTO,
  CATALOG_TIPOS_PERSONA,
  CATALOG_TIPOS_SANCION,
} from "../../constants/catalog";
import type { CatalogOption } from "../../types/catalog";
import {
  ACTIVIDADES,
  DEPARTAMENTOS,
  JUEGOS_PERMITIDOS,
  MUNICIPIOS_POR_DEPARTAMENTO,
  PERIODOS_ANUALES,
  TIPOS_DECLARACION,
  TIPOS_DOCUMENTO,
  TIPOS_PERSONA,
  TIPOS_SANCION,
} from "./mockCatalog.data";

export const MOCK_OPTION_COUNT = 3;

export const MOCK_CATALOGS: Record<string, (parent?: string) => CatalogOption[]> = {
  [CATALOG_DEPARTAMENTOS]: () => DEPARTAMENTOS,
  [CATALOG_MUNICIPIOS]: (parent) => (parent ? (MUNICIPIOS_POR_DEPARTAMENTO[parent] ?? []) : []),
  [CATALOG_TIPOS_DOCUMENTO]: () => TIPOS_DOCUMENTO,
  [CATALOG_TIPOS_PERSONA]: () => TIPOS_PERSONA,
  [CATALOG_PERIODOS_ANUALES]: () => PERIODOS_ANUALES,
  [CATALOG_TIPOS_DECLARACION]: () => TIPOS_DECLARACION,
  [CATALOG_TIPOS_SANCION]: () => TIPOS_SANCION,
  [CATALOG_JUEGOS_PERMITIDOS]: () => JUEGOS_PERMITIDOS,
  [CATALOG_ACTIVIDADES]: () => ACTIVIDADES,
};

// Catalogos que el JSON todavia no declara: el simulador los reconoce por la hoja del payload a la
// que el campo esta mapeado. Vive solo aca, el contrato no cambia. Las entradas que ya tienen
// catalogo declarado se comparten en vez de copiarse, para que no se separen con el tiempo: siguen
// aca porque cubren a los campos que el autor cree a mano sin declarar dataSource.
export const MOCK_BY_LEAF: Record<string, CatalogOption[]> = {
  idTipoDocumento: TIPOS_DOCUMENTO,
  idTipoPersona: TIPOS_PERSONA,
  idPeriodoAnual: PERIODOS_ANUALES,
  idTipoDeclaracion: TIPOS_DECLARACION,
  idTipoSancion: TIPOS_SANCION,
  idTipoJuegoPermitido: JUEGOS_PERMITIDOS,
  idActividad: ACTIVIDADES,
  // Estos tres son los unicos que siguen inventados: nunca vinieron en un volcado.
  periodoAnio: [
    { id: "2026", label: "2026" },
    { id: "2025", label: "2025" },
    { id: "2024", label: "2024" },
    { id: "2023", label: "2023" },
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
};
