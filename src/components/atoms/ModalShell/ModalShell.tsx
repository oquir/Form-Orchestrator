import { useId } from "react";
import { Xmark } from "reicon-react";
import {
  BODY_CLASSES,
  CLOSE_BUTTON_CLASSES,
  DESCRIPTION_CLASSES,
  EYEBROW_CLASSES,
  FOOTER_CLASSES,
  HEADER_CLASSES,
  OVERLAY_CLASSES,
  PANEL_CLASSES,
  TITLE_CLASSES,
} from "./ModalShell.constants";
import type { ModalShellProps } from "./ModalShell.types";

export function ModalShell({
  title,
  children,
  eyebrow,
  description,
  footer,
  onClose,
  maxWidthClassName = "max-w-md",
}: ModalShellProps) {
  const titleId: string = useId();

  return (
    <div className={OVERLAY_CLASSES}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${PANEL_CLASSES} ${maxWidthClassName}`}
      >
        <header className={HEADER_CLASSES}>
          <div className="flex min-w-0 flex-col gap-2">
            {eyebrow && <span className={EYEBROW_CLASSES}>{eyebrow}</span>}
            <h2 id={titleId} className={TITLE_CLASSES}>
              {title}
            </h2>
            {description && <p className={DESCRIPTION_CLASSES}>{description}</p>}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
              className={CLOSE_BUTTON_CLASSES}
            >
              <Xmark size={16} />
            </button>
          )}
        </header>

        <div className={BODY_CLASSES}>{children}</div>

        {footer && <footer className={FOOTER_CLASSES}>{footer}</footer>}
      </div>
    </div>
  );
}
