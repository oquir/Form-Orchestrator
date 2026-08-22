import type { CatalogBank, CatalogEntry, CatalogSource } from "./catalog";
import type { FechasMaximasPresentacion, MaxDatesSource, StoredMaxDates } from "./maxDates";
import type { StoredValores, ValorAnual, ValoresSource } from "./valores";

// Los tres bancos que solo existen para que el simulador pueda calcular: catalogos, fechas maximas
// de presentacion y valores anuales (UVT y SMMLV). No entran al borrador ni al JSON exportado, y
// cada uno vive en su propia clave de localStorage, asi que se comparten entre todos los
// formularios. Estan aparte del resto del store porque no tocan el lienzo.
export interface BanksSlice {
  catalogBank: CatalogBank;
  maxDates: StoredMaxDates;
  valores: StoredValores;
  setCatalogEntries: (catalogId: string, entries: CatalogEntry[]) => void;
  setCatalogSource: (catalogId: string, source: CatalogSource) => void;
  clearCatalogEntries: (catalogId: string) => void;
  // Pasar null vuelve a la tabla generada. El store no sabe generar ni editar fechas: recibe la
  // tabla ya armada, que es lo que deja la aritmetica entera en lib/maxDates.
  setMaxDates: (fechas: FechasMaximasPresentacion | null) => void;
  setMaxDatesSource: (source: MaxDatesSource) => void;
  // Mismo trato que las fechas: null vuelve a la tabla de fabrica sin tirar lo cargado.
  setValores: (valores: ValorAnual[] | null) => void;
  setValoresSource: (source: ValoresSource) => void;
}
