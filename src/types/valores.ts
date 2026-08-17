// Los valores anuales que no fija el municipio: la UVT la publica la DIAN por resolucion y el
// SMMLV sale por decreto. En el aplicativo que consume el JSON le llegan por su propio endpoint,
// asi que aca viven en un banco propio -- ni en el borrador ni en el export -- para que el
// simulador pueda calcular contra numeros de verdad. Ver lib/valoresBank.
//
// NO son un catalogo, y por eso no entran en CatalogBank. Un catalogo es una lista de opciones
// {id, label} que alimenta un desplegable; esto son dos escalares por ano que nadie elige de una
// lista. Meterlos ahi obligaria a guardar un numero dentro de `label`, que es texto para mostrar,
// y ademas los ofreceria como origen de opciones de un campo, que no significa nada.

export interface ValorAnual {
  anio: number;
  // Unidad de Valor Tributario, en pesos.
  uvt: number;
  // Salario minimo mensual legal vigente, en pesos.
  smmlv: number;
}

export type ValoresSource = "default" | "custom";

// Mismo trato que StoredCatalog y StoredMaxDates: volver a "default" no borra lo cargado, solo lo
// ignora. Por eso la tabla pegada vive aparte de la de fabrica en vez de reemplazarla.
export interface StoredValores {
  source: ValoresSource;
  custom: ValorAnual[] | null;
}

// Como se llaman las columnas en la respuesta del endpoint. Se piden igual que en un catalogo y al
// reves que en la tabla de fechas: esto es una lista plana, asi que hay que decir cual clave es
// cual. La tabla de fechas ya viene con la forma que se necesita y solo hay que comprobarla.
export interface ValoresParseKeys {
  anio: string;
  uvt: string;
  smmlv: string;
}

export interface ValoresParseResult {
  valores: ValorAnual[] | null;
  error: string | null;
}
