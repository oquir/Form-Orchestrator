import type { OrphanBinding } from "../../types/payloadMapping";

export interface UsePayloadPreviewCanvasResult {
  summaryJson: string;
  orphanBindings: OrphanBinding[];
  copied: boolean;
  handleCopy: () => Promise<void>;
}
