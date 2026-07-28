import { useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import type { FieldOptionsModalProps } from "./FieldOptionsModal.types";

export function FieldOptionsModal({ fieldTypeLabel, onConfirm, onCancel }: FieldOptionsModalProps) {
  const [title, setTitle] = useState<string>("");
  const [optionCount, setOptionCount] = useState<number>(2);
  const isValid = optionCount >= 2;

  return (
    <ModalShell>
      <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        Opciones del {fieldTypeLabel}
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-neutral-400">
        Al excluir el campo del payload sus opciones las definís vos. Indicá cuántas tendrá; podrás
        editar las etiquetas después.
      </p>

      <div className="mb-4 flex flex-col gap-4">
        <LabeledInput
          id="options-field-title"
          label="Título del grupo (opcional)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Frecuencia de pago"
        />

        <LabeledInput
          id="options-field-count"
          label="Cantidad de opciones"
          type="number"
          min={2}
          value={optionCount}
          onChange={(event) => setOptionCount(Number(event.target.value))}
        />
      </div>

      <ModalActions>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!isValid}
          onClick={() => onConfirm({ title: title.trim() || undefined, optionCount })}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Excluir y configurar
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
