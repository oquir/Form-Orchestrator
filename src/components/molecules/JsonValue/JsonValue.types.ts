import type { JsonNode } from "../../../types/jsonTree";

export interface JsonValueProps {
  value: JsonNode;
  indent: number;
  nodeKey: string;
}
