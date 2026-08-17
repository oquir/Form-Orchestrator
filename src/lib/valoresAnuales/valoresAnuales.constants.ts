import type { ValorAnual } from "../../types/valores";

// Los valores publicados, para que el simulador arranque calculando algo real. No son inventados
// como podrian serlo unas tarifas: la UVT sale de una resolucion de la DIAN y el SMMLV de un
// decreto, hay un unico numero por ano y es publico.
//
// Aun asi son datos de prueba, igual que los catalogos de mentira: el aplicativo que consume el
// JSON los pide a su endpoint, y aca el autor puede reemplazarlos pegando los suyos. Se ordenan del
// mas nuevo al mas viejo porque el que se mira es el de arriba.
//
// Los de 2026 estan verificados contra la resolucion 000238 de 2025 y el decreto del salario
// minimo; los anteriores son los publicados de cada ano y conviene contrastarlos antes de liquidar
// una declaracion vieja con ellos.
export const VALORES_POR_DEFECTO: ValorAnual[] = [
  { anio: 2026, uvt: 52374, smmlv: 1750905 },
  { anio: 2025, uvt: 49799, smmlv: 1423500 },
  { anio: 2024, uvt: 47065, smmlv: 1300000 },
  { anio: 2023, uvt: 42412, smmlv: 1160000 },
  { anio: 2022, uvt: 38004, smmlv: 1000000 },
  { anio: 2021, uvt: 36308, smmlv: 908526 },
  { anio: 2020, uvt: 35607, smmlv: 877803 },
];
