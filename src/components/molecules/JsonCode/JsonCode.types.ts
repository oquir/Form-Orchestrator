export type JsonTokenKind = "key" | "string" | "number" | "boolean" | "null";

export interface JsonToken {
  text: string;
  kind: JsonTokenKind;
  offset: number;
}

export type JsonSegment = string | JsonToken;

export interface JsonLine {
  text: string;
  offset: number;
  opensContainer: boolean;
  openChar: "{" | "[" | null;
  closeIndex: number;
  trailingComma: boolean;
}

export interface JsonCodeProps {
  json: string;
  valueClassName?: (rawValue: string) => string | undefined;
  className?: string;
}
