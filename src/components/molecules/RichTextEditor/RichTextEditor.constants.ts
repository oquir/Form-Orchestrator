import type { RichTextCommand } from "../../../types/richText";

export { ERROR_CLASSES, HINT_CLASSES } from "../../../constants/uiClasses";

export const EDITOR_CLASSES: string =
  "min-h-24 w-full rounded-md border border-border bg-field px-2 py-1.5 text-xs text-fg outline-none focus:border-brand-border [&_a]:text-brand-fg [&_a]:underline";

export const TOOLBAR_CLASSES: string = "flex flex-wrap items-center gap-1";

export const TOOL_BUTTON_CLASSES: string =
  "rounded border border-border px-2 py-0.5 text-xs text-fg-soft hover:cursor-pointer hover:border-brand-border hover:text-brand-fg disabled:cursor-not-allowed disabled:opacity-40";

export const LINK_INPUT_CLASSES: string =
  "min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export const FORMAT_BUTTONS: { command: RichTextCommand; label: string; title: string }[] = [
  { command: "bold", label: "N", title: "Negrita" },
  { command: "italic", label: "C", title: "Cursiva" },
  { command: "underline", label: "S", title: "Subrayado" },
];
