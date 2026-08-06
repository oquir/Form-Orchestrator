import type { FormType } from "../../../types/setup";

export interface FormTypeOption {
  value: FormType;
  label: string;
  description: string;
}

export interface SetupWizardModalProps {
  // El borrador guardado no paso la validacion y se descarto. Se avisa aca porque es donde el
  // usuario aterriza, y porque callarlo seria hacerle creer que nunca habia guardado nada.
  draftWasInvalid?: boolean;
}
