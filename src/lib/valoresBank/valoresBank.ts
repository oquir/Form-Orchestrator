import type {
  StoredValores,
  ValorAnual,
  ValoresParseKeys,
  ValoresParseResult,
} from "../../types/valores";
import { VALORES_POR_DEFECTO } from "../valoresAnuales/valoresAnuales.constants";
import { VALORES_KEY } from "./valoresBank.constants";
import { storedValoresSchema, valorAnualSchema } from "./valoresBank.schema";
import { findArray, leerNumero } from "./valoresBank.utils";

// Donde viven la UVT y el salario minimo mientras se prueba. Es el banco de fechas otra vez, con la
// misma regla: datos que el consumidor saca de su propio endpoint, que el simulador necesita para
// poder calcular, y que NO entran ni al borrador ni al export. Que no se filtren no es una promesa
// sino un hecho del codigo: ni exportForm ni persistence nombran este modulo.

const VACIO: StoredValores = { source: "default", custom: null };

export function loadValores(): StoredValores {
  const raw: string | null = localStorage.getItem(VALORES_KEY);
  if (!raw) return VACIO;

  try {
    const parsed = storedValoresSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : VACIO;
  } catch {
    return VACIO;
  }
}

export function saveValores(stored: StoredValores): void {
  localStorage.setItem(VALORES_KEY, JSON.stringify(stored));
}

// Una tabla en "default", o cargada pero sin ninguna fila, se comporta como si no estuviera.
export function usesCustomValores(stored: StoredValores): boolean {
  return stored.source === "custom" && stored.custom !== null && stored.custom.length > 0;
}

// La tabla que rige ahora mismo. Gana entera o no gana: si esta activa se usa aunque le falte el
// ano que se busca, igual que un catalogo personalizado se usa aunque el filtro no devuelva nada.
// Mezclar filas cargadas con filas de fabrica dejaria una tabla en la que no se sabe cual es cual.
export function valoresEnUso(stored: StoredValores): ValorAnual[] {
  return usesCustomValores(stored) && stored.custom ? stored.custom : VALORES_POR_DEFECTO;
}

// Se pega la respuesta del endpoint y se dice como se llama cada columna, igual que un catalogo:
// esto es una lista plana y no hay forma de adivinar cual clave es el ano. Una fila a la que le
// falte cualquiera de las tres se descarta; media fila daria un valor de 0 que pasa por dato bueno.
export function parseValoresPaste(raw: string, keys: ValoresParseKeys): ValoresParseResult {
  if (raw.trim() === "") return { valores: null, error: "Pegá la respuesta del endpoint." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valores: null, error: "No es JSON válido." };
  }

  const items: unknown[] | null = findArray(parsed);
  if (!items) return { valores: null, error: "No se encontró ninguna lista dentro del JSON." };

  const valores: ValorAnual[] = [];

  for (const item of items) {
    const fila = {
      anio: leerNumero(item, keys.anio),
      uvt: leerNumero(item, keys.uvt),
      smmlv: leerNumero(item, keys.smmlv),
    };

    const result = valorAnualSchema.safeParse(fila);
    if (result.success) valores.push(result.data);
  }

  if (valores.length === 0) {
    return {
      valores: null,
      error: `Ninguna fila trajo ${keys.anio}, ${keys.uvt} y ${keys.smmlv} con valores numéricos.`,
    };
  }

  // Del mas nuevo al mas viejo, que es el orden en que se miran y el que usa la tabla de fabrica.
  valores.sort((a, b) => b.anio - a.anio);

  return { valores, error: null };
}
