import { useMemo, useState } from "react";
import { slugifyFieldName } from "../../../lib/fieldName/fieldName";
import { useFormStore } from "../../../store/formStore";
import { LabeledInput } from "../LabeledInput/LabeledInput";
import {
  ERROR_CLASSES,
  ERROR_INPUT_CLASSES,
  HINT_CLASSES,
  PREVIEW_CLASSES,
} from "./FieldNameInput.constants";
import type { FieldNameInputProps } from "./FieldNameInput.types";
import { takenFieldNames } from "./FieldNameInput.utils";

export function FieldNameInput({ field }: FieldNameInputProps) {
  const setFieldName = useFormStore((state) => state.setFieldName);
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const [draft, setDraft] = useState<string | null>(null);

  const taken: Set<string> = useMemo(
    () => takenFieldNames(formSteps, introSteps, field.id),
    [formSteps, introSteps, field.id],
  );

  const slug: string = draft === null ? field.name : slugifyFieldName(draft);
  const isEmpty: boolean = draft !== null && draft.trim().length === 0;
  const isTaken: boolean = draft !== null && !isEmpty && taken.has(slug);
  const hasError: boolean = isEmpty || isTaken;
  const showsPreview: boolean = draft !== null && !hasError && slug !== draft;

  // Un nombre repetido no se corrige solo: antes se guardaba con sufijo y el autor se quedaba
  // creyendo que habia escrito el otro, con las formulas apuntando al campo equivocado. El
  // borrador se conserva junto con el error para que la correccion se haga aca y no en silencio.
  function commit(): void {
    if (draft === null || hasError) return;

    setFieldName(field.id, draft);
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-1">
      <LabeledInput
        id="field-name"
        label="Nombre técnico"
        value={draft ?? field.name}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setDraft(null);
        }}
        aria-invalid={hasError}
        className={hasError ? ERROR_INPUT_CLASSES : ""}
        spellCheck={false}
      />

      {isTaken && (
        <p className={ERROR_CLASSES}>
          Ya existe un campo llamado <code>{slug}</code>. Elegí otro nombre: dos campos con el mismo
          nombre romperían las fórmulas y el payload.
        </p>
      )}

      {isEmpty && <p className={ERROR_CLASSES}>El nombre técnico no puede quedar vacío.</p>}

      {showsPreview && (
        <p className={PREVIEW_CLASSES}>
          Se va a guardar como <code>{slug}</code>.
        </p>
      )}

      <p className={HINT_CLASSES}>
        Con este nombre lo referencian las fórmulas y el formulario generado. Se normaliza a
        minúsculas con guiones bajos y tiene que ser único en todo el formulario.
      </p>
    </div>
  );
}
