import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { buildFieldGraph } from "../../lib/fieldGraph/fieldGraph";
import {
  buildCalcTermOptions,
  buildSimpleCalcScript,
  indexCalcTermOptions,
  parseSimpleCalcScript,
} from "../../lib/simpleCalc/simpleCalc";
import { useFormStore } from "../../store/formStore";
import type {
  CalcSign,
  CalcTermDraft,
  CalcTermIndex,
  CalcTermOption,
  CalcTermOptionGroup,
  SimpleCalc,
  SimpleCalcTerm,
} from "../../types/simpleCalc";
import { INVALID_MULTIPLIER_MESSAGE, MULTIPLIER_PATTERN } from "./useSimpleCalcBuilder.constants";
import type {
  InitialSimpleCalc,
  UseSimpleCalcBuilderParams,
  UseSimpleCalcBuilderResult,
} from "./useSimpleCalcBuilder.types";

// Estado del modal de calculo sin codigo: las filas que se van armando, el multiplicador y el piso,
// y lo que falta para poder aplicar. Nada toca el store hasta Aplicar, asi Cancelar no deja rastro
// y el historial recibe un solo paso.

function emptyTerm(): CalcTermDraft {
  return { id: uuidv4(), sign: "+", fieldId: null };
}

export function useSimpleCalcBuilder({
  field,
  candidates,
  onClose,
}: UseSimpleCalcBuilderParams): UseSimpleCalcBuilderResult {
  const formSteps = useFormStore((state) => state.formSteps);
  const setFieldScript = useFormStore((state) => state.setFieldScript);

  const optionGroups: CalcTermOptionGroup[] = useMemo(
    () => buildCalcTermOptions(formSteps, field, buildFieldGraph([field, ...candidates])),
    [formSteps, field, candidates],
  );
  const index: CalcTermIndex = useMemo(() => indexCalcTermOptions(optionGroups), [optionGroups]);

  // El script se lee una sola vez, al abrir: despues manda lo que se arma en el modal.
  const [initial] = useState<InitialSimpleCalc>(() => {
    const source: string = field.logic.script ?? "";
    const parsed: SimpleCalc | null = parseSimpleCalcScript(source, index);

    return { parsed, replacesCustomScript: parsed === null && source.trim().length > 0 };
  });
  const [terms, setTerms] = useState<CalcTermDraft[]>(() =>
    initial.parsed === null
      ? [emptyTerm()]
      : initial.parsed.terms.map((term) => ({ id: uuidv4(), ...term })),
  );
  const [floorAtZero, setFloorAtZero] = useState<boolean>(initial.parsed?.floorAtZero ?? false);
  const [multiplierText, setMultiplierText] = useState<string>(
    initial.parsed === null || initial.parsed.multiplier === null
      ? ""
      : String(initial.parsed.multiplier),
  );

  const firstSelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    firstSelectRef.current?.focus();
  }, []);

  // Fase de captura en window: corre antes que los atajos globales y que el Escape del menu
  // contextual, sea cual sea el foco (tras un clic en el fondo queda en el body). Sin esto, Delete
  // borraria el campo que se esta editando y Escape lo deseleccionaria, desmontando el modal con
  // todo lo armado. Sin preventDefault: escribir, elegir en el select y activar botones siguen
  // funcionando.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      event.stopPropagation();
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown, true);

    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  const trimmedMultiplier: string = multiplierText.trim();
  const multiplier: number | null =
    trimmedMultiplier === "" ? null : Number(trimmedMultiplier.replace(",", "."));
  const isMultiplierValid: boolean =
    multiplier === null ||
    (MULTIPLIER_PATTERN.test(trimmedMultiplier) && Number.isFinite(multiplier));

  const chosen: SimpleCalcTerm[] = terms.flatMap((term) =>
    term.fieldId !== null && index.byId.has(term.fieldId)
      ? [{ sign: term.sign, fieldId: term.fieldId }]
      : [],
  );
  const isComplete: boolean = terms.length > 0 && chosen.length === terms.length;

  const problems: string[] = [];
  const cycleLabels: Set<string> = new Set();

  for (const term of chosen) {
    const option: CalcTermOption | undefined = index.byId.get(term.fieldId);
    if (option?.createsCycle) cycleLabels.add(option.label);
  }

  for (const label of cycleLabels) {
    problems.push(`«${label}» ya depende de este campo: usarlo cerraría un ciclo.`);
  }

  if (!isMultiplierValid) problems.push(INVALID_MULTIPLIER_MESSAGE);

  const preview: string | null =
    isComplete && problems.length === 0
      ? buildSimpleCalcScript({ terms: chosen, floorAtZero, multiplier }, index)
      : null;

  function addTerm(): void {
    setTerms((current) => [...current, emptyTerm()]);
  }

  function removeTerm(id: string): void {
    setTerms((current) => current.filter((term) => term.id !== id));
  }

  function setTermSign(id: string, sign: CalcSign): void {
    setTerms((current) => current.map((term) => (term.id === id ? { ...term, sign } : term)));
  }

  function setTermField(id: string, fieldId: string): void {
    setTerms((current) =>
      current.map((term) =>
        term.id === id ? { ...term, fieldId: fieldId === "" ? null : fieldId } : term,
      ),
    );
  }

  function apply(): void {
    if (preview === null) return;

    setFieldScript(field.id, preview);
    onClose();
  }

  return {
    optionGroups,
    terms,
    floorAtZero,
    multiplierText,
    replacesCustomScript: initial.replacesCustomScript,
    problems,
    preview,
    firstSelectRef,
    addTerm,
    removeTerm,
    setTermSign,
    setTermField,
    setFloorAtZero,
    setMultiplierText,
    apply,
  };
}
