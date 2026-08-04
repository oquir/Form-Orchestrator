import type { CatalogDefinition, CatalogEntry } from "../../../../types/catalog";

export interface CatalogCardProps {
  catalog: CatalogDefinition;
  entries: CatalogEntry[];
}
