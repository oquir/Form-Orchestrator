import type { KeyboardEvent, RefObject } from "react";

export interface UseModalKeyGuardResult {
  dialogRef: RefObject<HTMLDivElement | null>;
  handleDialogKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}
