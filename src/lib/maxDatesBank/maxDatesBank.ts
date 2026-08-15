import type {
  FechasMaximasPresentacion,
  MaxDatesParseResult,
  StoredMaxDates,
} from "../../types/maxDates";
import { generarFechasPorDefecto } from "../maxDates/maxDates";
import { MAX_DATES_KEY } from "./maxDatesBank.constants";
import { fechasMaximasSchema, storedMaxDatesSchema } from "./maxDatesBank.schema";
import { candidateObjects } from "./maxDatesBank.utils";

// Donde viven las fechas maximas mientras se prueba. Es el banco de catalogos otra vez: datos que
// el consumidor saca de su propio endpoint, que el simulador necesita para poder probar y que NO
// entran ni al borrador ni al export. Que no se filtren no es una promesa sino un hecho del codigo:
// ni exportForm ni persistence nombran este modulo.

const VACIO: StoredMaxDates = { source: "default", custom: null };

export function loadMaxDates(): StoredMaxDates {
  const raw: string | null = localStorage.getItem(MAX_DATES_KEY);
  if (!raw) return VACIO;

  try {
    const parsed = storedMaxDatesSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : VACIO;
  } catch {
    return VACIO;
  }
}

export function saveMaxDates(stored: StoredMaxDates): void {
  localStorage.setItem(MAX_DATES_KEY, JSON.stringify(stored));
}

// Una tabla en "default", o cargada pero sin ningun ano, se comporta como si no estuviera.
export function usesCustomMaxDates(stored: StoredMaxDates): boolean {
  return stored.source === "custom" && stored.custom !== null;
}

// La tabla que rige ahora mismo. La generada se recalcula cada vez a proposito -- sigue al reloj,
// asi que en enero aparece el ano nuevo sin que nadie toque nada -- y por eso mismo es de solo
// lectura: editar cualquier fecha saca una copia propia, que es lo que hace el panel.
export function maxDatesEnUso(
  stored: StoredMaxDates,
  anioActual: number,
): FechasMaximasPresentacion {
  return usesCustomMaxDates(stored) && stored.custom
    ? stored.custom
    : generarFechasPorDefecto(anioActual);
}

// Se pega el objeto entero del endpoint, sin nombrar columnas. A diferencia de un catalogo -- una
// lista plana de la que hay que decir cual clave es el id -- esta respuesta ya viene con la forma
// que se necesita, asi que lo unico que hace falta es comprobar que la tenga.
export function parseMaxDatesPaste(raw: string): MaxDatesParseResult {
  if (raw.trim() === "") return { fechas: null, error: "Pegá la respuesta del endpoint." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { fechas: null, error: "No es JSON válido." };
  }

  for (const candidate of candidateObjects(parsed)) {
    const result = fechasMaximasSchema.safeParse(candidate);
    if (result.success) return { fechas: result.data, error: null };
  }

  return {
    fechas: null,
    error: "El JSON no tiene la forma esperada: municipioId, ica, reteica y autoretencionIca.",
  };
}
