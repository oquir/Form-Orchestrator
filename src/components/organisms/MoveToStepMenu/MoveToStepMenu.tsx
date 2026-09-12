import { useRef, useState } from "react";
import { AngleDown2 } from "reicon-react";
import { CANVAS_TOOLBAR_ACTION_CLASSES } from "../../../constants/uiClasses";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
import { useFormStore } from "../../../store/formStore";
import type { CanvasTarget } from "../../../types/placement";
import {
  MENU_CAPTION_CLASSES,
  MENU_CLASSES,
  MENU_ITEM_CLASSES,
  MENU_NUMBER_CLASSES,
} from "./MoveToStepMenu.constants";
import type { MoveTargetSection, MoveToStepMenuProps } from "./MoveToStepMenu.types";
import { buildMoveSections } from "./MoveToStepMenu.utils";

export function MoveToStepMenu({ onSelect }: MoveToStepMenuProps) {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const sections: MoveTargetSection[] = buildMoveSections(formSteps, introSteps, activeCanvas);

  function apply(target: CanvasTarget): void {
    onSelect(target);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={sections.length === 0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Mover los campos seleccionados a otro paso"
        className={CANVAS_TOOLBAR_ACTION_CLASSES}
      >
        Mover a paso
        <AngleDown2 size={12} />
      </button>

      {isOpen && (
        <div className={MENU_CLASSES}>
          {sections.map((section) => (
            <div key={section.key} className="flex flex-col">
              {section.caption && <span className={MENU_CAPTION_CLASSES}>{section.caption}</span>}
              {section.options.map((option) => (
                <button
                  key={`${option.target.type}-${option.target.stepId}`}
                  type="button"
                  onClick={() => apply(option.target)}
                  className={MENU_ITEM_CLASSES}
                >
                  <span className={MENU_NUMBER_CLASSES}>{option.number}</span>
                  <span className="truncate">{option.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
