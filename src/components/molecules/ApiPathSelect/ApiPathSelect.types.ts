import type { SchemaLeaf } from "../../../lib/payloadSchema/payloadSchema.types";

export interface ApiPathSelectProps {
  path: string;
  leaves: SchemaLeaf[];
  isOrphan: boolean;
  onChange: (path: string) => void;
}
