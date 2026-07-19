export type JsonPrimitive = string | number | boolean | null;
export type JsonNode = JsonPrimitive | JsonNode[] | { [key: string]: JsonNode };
