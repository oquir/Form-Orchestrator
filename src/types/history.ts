import type { StoreApi } from "zustand";
import type { FormState } from "./formStoreTypes";

// Lo que guarda cada paso del historial: el documento -lo que se exporta y se autoguarda- mas el paso
// activo y la seleccion de ese momento. Asi deshacer vuelve a mostrar el cambio donde ocurrio y con
// lo que estaba seleccionado, en vez de alterar un paso que no se esta mirando.
export type HistorySnapshot = Pick<
  FormState,
  "formSteps" | "introModal" | "formScript" | "setupConfig" | "activeCanvas" | "selectedFieldIds"
>;

// El primer argumento con el que zundo llama a su handleSet: el snapshot de antes del cambio.
export type HistoryPastState = Parameters<StoreApi<FormState>["setState"]>[0];

export interface BurstGate {
  wrap<TArgs extends unknown[]>(fn: (...args: TArgs) => void): (...args: TArgs) => void;
  reset(): void;
}
