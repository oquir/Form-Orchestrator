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

export interface JsonRowTokens {
  indent: string;
  tokens: JsonSegment[];
}

export interface JsonModel {
  lines: JsonLine[];
  rows: JsonRowTokens[];
}

export interface JsonVisibleRow {
  lineIndex: number;
  key: number;
  indent: string;
  tokens: JsonSegment[];
  opensContainer: boolean;
  isCollapsed: boolean;
  closeChar: string;
  trailingComma: boolean;
}

export interface JsonCodeProps {
  json: string;
  valueClassName?: (rawValue: string) => string | undefined;
  className?: string;
}
