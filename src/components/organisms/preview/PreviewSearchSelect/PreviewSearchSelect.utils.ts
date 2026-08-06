import type { CatalogOption } from "../../../../types/catalog";

export function optionText(option: CatalogOption): string {
  return option.code ? `${option.code} · ${option.label}` : option.label;
}

// El simbolo por mil se lee como un porcentaje en pantalla, y son ordenes de magnitud distintos.
export function formatTarifa(tarifa: number): string {
  return `${tarifa}X1000`;
}
