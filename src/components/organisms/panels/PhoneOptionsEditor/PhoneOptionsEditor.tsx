import { phoneKindOf } from "../../../../lib/fieldContact/fieldContact";
import { useFormStore } from "../../../../store/formStore";
import type { PhoneKind } from "../../../../types/fieldContact";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  KIND_CHOICES,
  KIND_ITEM_ACTIVE_CLASSES,
  KIND_ITEM_BASE_CLASSES,
  KIND_ITEM_INACTIVE_CLASSES,
  KIND_TRACK_CLASSES,
  PHONE_DESCRIPTION,
} from "./PhoneOptionsEditor.constants";
import type { PhoneOptionsEditorProps } from "./PhoneOptionsEditor.types";

export function PhoneOptionsEditor({ field }: PhoneOptionsEditorProps) {
  const setFieldPhoneKind = useFormStore((state) => state.setFieldPhoneKind);
  const current: PhoneKind = phoneKindOf(field);

  return (
    <PanelSection title="Teléfono" description={PHONE_DESCRIPTION}>
      <fieldset aria-label="Qué número pide el campo" className={KIND_TRACK_CLASSES}>
        {KIND_CHOICES.map((choice) => (
          <button
            key={choice.kind}
            type="button"
            aria-pressed={current === choice.kind}
            onClick={() => setFieldPhoneKind(field.id, choice.kind)}
            className={`${KIND_ITEM_BASE_CLASSES} ${
              current === choice.kind ? KIND_ITEM_ACTIVE_CLASSES : KIND_ITEM_INACTIVE_CLASSES
            }`}
          >
            {choice.label}
          </button>
        ))}
      </fieldset>
    </PanelSection>
  );
}
