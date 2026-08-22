import type { CatalogDefinition, CatalogEntry, StoredCatalog } from "../../types/catalog";

export interface UseCatalogCardParams {
  catalog: CatalogDefinition;
  stored: StoredCatalog | undefined;
}

export interface UseCatalogCardResult {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  raw: string;
  setRaw: (raw: string) => void;
  idKey: string;
  setIdKey: (key: string) => void;
  labelKey: string;
  setLabelKey: (key: string) => void;
  parentKey: string;
  setParentKey: (key: string) => void;
  codeKey: string;
  setCodeKey: (key: string) => void;
  tarifaKey: string;
  setTarifaKey: (key: string) => void;
  error: string | null;
  entries: CatalogEntry[];
  loaded: boolean;
  isCustom: boolean;
  badge: string;
  load: () => void;
  setSource: (source: "default" | "custom") => void;
  clear: () => void;
}
