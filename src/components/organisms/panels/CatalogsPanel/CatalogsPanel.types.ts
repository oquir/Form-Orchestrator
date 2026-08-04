import type { CatalogDefinition, StoredCatalog } from "../../../../types/catalog";

export interface CatalogCardProps {
  catalog: CatalogDefinition;
  stored: StoredCatalog | undefined;
}
