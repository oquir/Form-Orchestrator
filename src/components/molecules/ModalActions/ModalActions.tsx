import type { ReactNode } from "react";

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}
