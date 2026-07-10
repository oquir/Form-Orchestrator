import type { ReactNode } from "react";

interface ModalShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
}

export function ModalShell({ children, maxWidthClassName = "max-w-md" }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className={`w-full ${maxWidthClassName} rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900`}
      >
        {children}
      </div>
    </div>
  );
}
