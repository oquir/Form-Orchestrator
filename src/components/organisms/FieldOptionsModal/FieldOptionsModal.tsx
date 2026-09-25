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
    <ModalShell
      title={`Opciones del ${fieldTypeLabel}`}
      description="Al excluir el campo del payload sus opciones las definís vos. Indicá cuántas tendrá; podrás editar las etiquetas después."
      onClose={onCancel}
      footer={
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
      }
    >
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
    </ModalShell>
  );
}
