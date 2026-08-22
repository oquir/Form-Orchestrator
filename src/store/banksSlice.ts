import type { StoreApi } from "zustand";
import { loadCatalogBank, saveCatalogBank } from "../lib/catalogBank/catalogBank";
import { loadMaxDates, saveMaxDates } from "../lib/maxDatesBank/maxDatesBank";
import { loadValores, saveValores } from "../lib/valoresBank/valoresBank";
import type { BanksSlice } from "../types/banksSlice";
import type { CatalogBank } from "../types/catalog";
import type { FormState } from "../types/formStoreTypes";
import type { StoredMaxDates } from "../types/maxDates";
import type { StoredValores } from "../types/valores";

// Los tres bancos de datos que alimentan al simulador. Se separan del resto del store porque no
// comparten nada con el: no tocan formSteps ni introModal, no entran al borrador y no viajan en el
// export. Siguen siendo parte del mismo objeto de estado -se mezclan con spread en formStore-, asi
// que quien los lee lo hace con el mismo useFormStore de siempre y no cambia nada del lado del
// consumidor.
//
// Cada accion guarda en localStorage ademas de escribir el estado: son datos que sobreviven a
// descartar un borrador, que es justo lo que los hace utiles entre formularios.
//
// Recibe solo set y no la terna (set, get, api) de un StateCreator de zustand: ninguna de estas
// acciones necesita leer el estado fuera de su propio callback. Declararlo como StateCreator
// prometeria un acceso que no usa, y ademas alargaria la llamada en formStore lo suficiente como
// para que el formateador reindente el store entero.
export function createBanksSlice(set: StoreApi<FormState>["setState"]): BanksSlice {
  return {
    catalogBank: loadCatalogBank(),
    maxDates: loadMaxDates(),
    valores: loadValores(),
    // El banco no entra al borrador: se guarda en su propia clave y sobrevive a descartarlo.
    setCatalogEntries: (catalogId, entries) =>
      set((state) => {
        const catalogBank: CatalogBank = {
          ...state.catalogBank,
          [catalogId]: { source: "custom", entries },
        };
        saveCatalogBank(catalogBank);

        return { catalogBank };
      }),
    // Cambiar de origen conserva lo cargado: volver a lo personalizado no obliga a pegarlo de nuevo.
    setCatalogSource: (catalogId, source) =>
      set((state) => {
        const stored = state.catalogBank[catalogId];
        if (!stored) return state;

        const catalogBank: CatalogBank = {
          ...state.catalogBank,
          [catalogId]: { ...stored, source },
        };
        saveCatalogBank(catalogBank);

        return { catalogBank };
      }),
    clearCatalogEntries: (catalogId) =>
      set((state) => {
        const catalogBank: CatalogBank = { ...state.catalogBank };
        delete catalogBank[catalogId];
        saveCatalogBank(catalogBank);

        return { catalogBank };
      }),
    // Cargar una tabla la deja en uso: nadie pega un volcado para seguir mirando el generado.
    setMaxDates: (fechas) =>
      set((state) => {
        const maxDates: StoredMaxDates =
          fechas === null
            ? { ...state.maxDates, source: "default" }
            : { source: "custom", custom: fechas };
        saveMaxDates(maxDates);

        return { maxDates };
      }),
    // Vuelve a la generada sin tirar lo cargado, igual que un catalogo.
    setMaxDatesSource: (source) =>
      set((state) => {
        const maxDates: StoredMaxDates = { ...state.maxDates, source };
        saveMaxDates(maxDates);

        return { maxDates };
      }),
    // Cargar una tabla la deja en uso, igual que las fechas: nadie pega un volcado para seguir
    // mirando los valores de fabrica.
    setValores: (lista) =>
      set((state) => {
        const valores: StoredValores =
          lista === null
            ? { ...state.valores, source: "default" }
            : { source: "custom", custom: lista };
        saveValores(valores);

        return { valores };
      }),
    setValoresSource: (source) =>
      set((state) => {
        const valores: StoredValores = { ...state.valores, source };
        saveValores(valores);

        return { valores };
      }),
  };
}
