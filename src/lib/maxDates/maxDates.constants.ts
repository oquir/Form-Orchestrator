import type { Periodicidad } from "../../types/maxDates";

export const ANIOS_POR_DEFECTO: number = 10;

// La unica diferencia entre el generador de ICA y el de retencion. En industria y comercio se
// declara el ano inmediatamente anterior, asi que el vencimiento cae en el ano siguiente al
// gravable; en retencion se declara el ano en curso.
export const OFFSET_ICA: number = 1;

export const OFFSET_RETENCION: number = 0;

// Vencimiento por defecto, sobre el ano siguiente al gravable. Es lo mas comun, no una regla: cada
// municipio lo mueve, y por eso la tabla generada es un punto de partida editable.
export const MES_DIA_ICA: string = "03/31";

export const PERIODOS_POR_PERIODICIDAD: Record<Periodicidad, number> = {
  anual: 1,
  bimestral: 6,
  trimestral: 4,
  mensual: 12,
};

// Cuando un ano valida por digito hay una fecha por cada uno del 0 al 9.
export const DIGITOS: number = 10;
