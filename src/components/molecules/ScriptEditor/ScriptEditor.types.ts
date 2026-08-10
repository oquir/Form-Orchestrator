export interface ScriptEditorProps {
  // Van al div editable para que la etiqueta de afuera siga apuntando a algo enfocable.
  id: string;
  ariaLabel: string;
  value: string;
  // Con que nombres se sustituye un {campo}: alimenta el pintado, el autocompletado y el aviso.
  knownNames: Set<string>;
  placeholder?: string;
  minHeight?: string;
  onChange: (value: string) => void;
}
