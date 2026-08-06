import type { RefObject } from "react";
import type { CatalogOption } from "../../types/catalog";

export interface UsePreviewSearchSelectParams {
  options: CatalogOption[];
  value: unknown;
  onChange: (value: unknown) => void;
}

export interface UsePreviewSearchSelectResult {
  isOpen: boolean;
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  selected: CatalogOption | null;
  results: CatalogOption[];
  open: () => void;
  close: () => void;
  setQuery: (query: string) => void;
  choose: (option: CatalogOption | null) => void;
}
