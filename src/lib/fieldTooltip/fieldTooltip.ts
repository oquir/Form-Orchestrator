import { DEFAULT_TOOLTIP_POSITION } from "../../constants/fieldTooltip";
import { TOOLTIP_CAPABLE_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField, FieldTooltip, SavedComponent } from "../../types/field";
import { emptyRichText, isEmptyRichText } from "../richText/richText";

export function supportsTooltip(type: string): boolean {
  return TOOLTIP_CAPABLE_FIELD_TYPES.includes(type);
}

export function hasTooltip(field: CanvasField | SavedComponent): boolean {
  return supportsTooltip(field.type) && !isEmptyRichText(field.tooltip?.content);
}

export function exportableTooltip(field: CanvasField | SavedComponent): FieldTooltip | undefined {
  return hasTooltip(field) ? field.tooltip : undefined;
}

export function createEmptyTooltip(): FieldTooltip {
  return { content: emptyRichText(), position: DEFAULT_TOOLTIP_POSITION };
}
