import { FIELD_TYPES } from "../../../constants/fieldTypes";
import type { FieldTypeDef } from "../../../types/fieldTypes";

export const BASIC_FIELD_TYPES: FieldTypeDef[] = FIELD_TYPES.filter(
  (fieldType) => fieldType.category === "basico",
);
export const COMPLEX_FIELD_TYPES: FieldTypeDef[] = FIELD_TYPES.filter(
  (fieldType) => fieldType.category === "complejo",
);
