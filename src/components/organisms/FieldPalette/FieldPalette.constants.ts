import { FIELD_TYPES } from "../../../constants/fieldTypes";

export const BASIC_FIELD_TYPES = FIELD_TYPES.filter((fieldType) => fieldType.category === "basico");
export const COMPLEX_FIELD_TYPES = FIELD_TYPES.filter(
  (fieldType) => fieldType.category === "complejo",
);
