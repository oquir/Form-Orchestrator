import type { BurstGate, HistorySnapshot } from "../../types/history";

// Las piezas del historial que no dependen de zundo ni del store: que se guarda en cada paso, cuando
// dos estados son el mismo documento y como se agrupan los cambios en rafagas. El cableado con zundo
// vive en formStore.ts.

export function toHistorySnapshot(state: HistorySnapshot): HistorySnapshot {
  return {
    formSteps: state.formSteps,
    introModal: state.introModal,
    formScript: state.formScript,
    setupConfig: state.setupConfig,
    activeCanvas: state.activeCanvas,
    selectedFieldIds: state.selectedFieldIds,
  };
}

// Solo el documento decide si hubo un paso. El paso activo y la seleccion viajan en el snapshot pero
// no cuentan: sin esto, cada clic en un campo o en una pestana llenaria el historial de pasos que no
// cambian nada.
export function sameDocument(a: HistorySnapshot, b: HistorySnapshot): boolean {
  return (
    sameValue(a.formSteps, b.formSteps) &&
    sameValue(a.introModal, b.introModal) &&
    a.formScript === b.formScript &&
    sameValue(a.setupConfig, b.setupConfig)
  );
}

// Deja pasar el primer cambio de una rafaga y se traga los que llegan antes de que se cumpla la
// ventana desde el anterior. El que pasa es el que guarda el estado de ANTES de la rafaga, que es a
// donde tiene que volver deshacer; los tragados no guardan nada.
//
// reset() va en cada deshacer y rehacer: zundo solo vacia los pasos de rehacer cuando registra un
// cambio, y un cambio tragado justo despues de deshacer los dejaria vivos, listos para pisar lo que
// se acaba de escribir.
export function createBurstGate(windowMs: number, now: () => number = Date.now): BurstGate {
  let lastChange: number = Number.NEGATIVE_INFINITY;

  function wrap<TArgs extends unknown[]>(fn: (...args: TArgs) => void): (...args: TArgs) => void {
    return (...args: TArgs): void => {
      const time: number = now();
      if (time - lastChange > windowMs) fn(...args);
      lastChange = time;
    };
  }

  function reset(): void {
    lastChange = Number.NEGATIVE_INFINITY;
  }

  return { wrap, reset };
}

// Igualdad por contenido que corta en la primera referencia igual. Una referencia distinta no siempre
// es un cambio: varias acciones rearman pasos y filas enteros sin cambiar nada -soltar un campo donde
// estaba, el blur de un editor que confirma el mismo texto- y cada una dejaria un paso vacio, que
// Ctrl+Z "deshace" sin que se vea nada. Gracias a la estructura compartida casi todo el arbol sigue
// siendo la misma referencia, asi que el recorrido solo baja por lo que se rearmo.
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;

    return a.every((item, index) => sameValue(item, b[index]));
  }

  const left: Record<string, unknown> = a as Record<string, unknown>;
  const right: Record<string, unknown> = b as Record<string, unknown>;
  // La union de claves: una clave presente con undefined y una ausente dicen lo mismo.
  const keys: Set<string> = new Set<string>([...Object.keys(left), ...Object.keys(right)]);

  for (const key of keys) {
    if (!sameValue(left[key], right[key])) return false;
  }

  return true;
}
