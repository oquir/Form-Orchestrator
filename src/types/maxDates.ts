// Las fechas maximas de presentacion de un municipio, tal como llegan del API. Los nombres van en
// espanol porque son el contrato de ese endpoint, igual que las hojas de PAYLOAD_SCHEMA: cambiar
// uno aca es una linea, del otro lado rompe.
//
// El modelo aplana a proposito. Cada municipio, y cada ANO dentro del municipio, combina una
// periodicidad (1, 6, 4 o 12 periodos) con una validacion por digito del documento (ninguna, primer
// digito o ultimo). En vez de un tipo por combinacion -- fecha unica, por bimestre, por bimestre y
// digito -- va una lista plana donde cada entrada dice a que periodo y a que digito corresponde.
// Una sola forma cubre desde el caso mas simple hasta el mas enredado, sin uniones discriminadas ni
// casos especiales en quien la consume.
//
// Nada de esto viaja en el JSON exportado: el consumidor lo pide a su propio endpoint. Aca existe
// para que el simulador pueda probar contra fechas de verdad. Ver lib/maxDatesBank.

export type Periodicidad = "anual" | "bimestral" | "trimestral" | "mensual";

export type TipoDigitoValidacion = "ninguno" | "primer_digito" | "ultimo_digito";

// `periodo` va de 1 a la cantidad que declare la periodicidad del ano. `digito` solo aparece cuando
// el ano valida por digito. `fecha` en "YYYY/MM/DD", tal como la entrega el API.
export interface FechaLimite {
  periodo: number;
  digito?: number;
  fecha: string;
}

export interface ReglaAnio {
  anio: number;
  periodicidad: Periodicidad;
  tipoDigito: TipoDigitoValidacion;
  // Cuantas entradas trae depende de la combinacion: anual sin digito es una, mensual por ultimo
  // digito son 12 x 10 = 120.
  fechas: FechaLimite[];
}

export type DeclaracionKind = "ica" | "reteica" | "autoretencionIca";

export interface FechasMaximasPresentacion {
  municipioId: number | string;
  ica: ReglaAnio[];
  reteica: ReglaAnio[];
  autoretencionIca: ReglaAnio[];
}

export type MaxDatesSource = "default" | "custom";

// Mismo trato que StoredCatalog: volver a "default" no borra lo cargado, solo lo ignora. Por eso la
// tabla pegada vive aparte de la generada en vez de reemplazarla.
export interface StoredMaxDates {
  source: MaxDatesSource;
  custom: FechasMaximasPresentacion | null;
}

export interface MaxDatesParseResult {
  fechas: FechasMaximasPresentacion | null;
  error: string | null;
}
