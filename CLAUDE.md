# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder described below is implemented. `docs/Project.md` (in Spanish) is the original product spec — still the reference for the target JSON schema shape and any unimplemented details; check it before adding features so structure matches the intended data model.

Not yet implemented / known gaps:
- No Monaco-style code editor for the Logic tab — `LogicPanel` currently edits `logic.typeScript` as a plain string, and dependencies (`toggleFieldDependency`) are simple field-id toggles, not conditional expressions.
- No test runner configured, and none will be added: the user considers the project too volatile to justify tests right now.
- `logic.typeScript` is exported as a raw string; the consumer will need `new Function()`/`eval` to execute it. The user builds the consumer too, so this is a coordinated decision — not a public API constraint.
- No draft schema versioning in `persistence.ts`; if the store shape changes, old localStorage drafts can silently break.

## Commit conventions

- Write commit messages **in Spanish**, present tense, imperative ("Agrega X", "Corrige Y", "Amplía Z") — matches the existing history style (`git log`).
- Keep the subject line under ~72 chars and specific ("Agrega campo Archivo con presets de formatos" beats "Nuevo campo").
- When the change is non-trivial, include a body (`git commit -m "subject" -m "body"`) explaining **the why and the touch points** — which files/actions/store shape changed, and any decisions that would be non-obvious from the diff. Someone reading `git show <sha>` should not need to re-read the code to understand the intent.
- Do **not** add `Co-Authored-By: Claude` or similar trailers unless the user explicitly asks — the existing history doesn't use them.
- Prefer one commit per cohesive feature/decision. Split only when the parts are genuinely independent; don't split a single feature just because it touches many files.
- Line-ending noise: `.gitattributes` normalizes to LF, so `git status` should stay clean on Windows. If it doesn't, run `git add --renormalize .` once — don't stage random `M` lines as part of feature commits.

## Commands

Package manager is **bun** (`bun.lock` present) — use `bun install` / `bun add`, not npm/yarn/pnpm.

- `bun run dev` — start Vite dev server
- `bun run build` — typecheck (`tsc -b`) then production build via Vite
- `bun run lint` — Biome check (linting + format check)
- `bun run lint:fix` — Biome check with auto-fix
- `bun run format` — Biome format, write mode
- `bun run preview` — preview production build

There is no test runner configured yet. **Biome is the enforced linter/formatter** (2-space indent, double quotes, semicolons, 100-char line width, auto-organizes imports on check) — `eslint.config.js` exists but is not wired into an npm script, so prefer Biome conventions when in doubt.

## Architecture

The app is a visual, drag-and-drop **step-by-step form builder** ("Form Orchestrator") that compiles its entire configuration down to a single structured JSON document.

- **Setup wizard** (`src/components/setup/SetupWizard.tsx`): 2-step modal shown when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads `getIndustriaComercioTemplate()` (`src/lib/baseTemplate.ts`) as the initial `rows`; the other two types start from a single blank row. Step 2 asks whether an intro modal is needed and, if so, how many steps — this seeds `introModal.steps` in the store. `DraftRecoveryPrompt` (`src/components/setup/DraftRecoveryPrompt.tsx`) runs before the wizard on mount if `loadDraft()` finds a saved draft.
- **State** — single Zustand store, `src/store/formStore.ts` (`useFormStore`). Holds `rows` (main form canvas), `introModal.steps[]` (each with its own `rows`), `activeCanvas` (`{type: "main"}` or `{type: "introStep", stepId}` — which canvas is currently being edited), `selectedFieldId`, `savedComponents` ("Almacén de Partes"), and `setupConfig`. `getActiveRows`/`findFieldById`/`getAllFields` are selector helpers exported alongside the store. Field/row mutations (`addFieldToRow`, `updateField`, `updateFieldValidations/Styles/Logic`, `toggleFieldDependency`, `addRowToActiveCanvas`, `removeRow`, `addIntroModalStep`, `removeIntroModalStep`) apply uniformly across whichever canvas contains the target id via `mapRowEverywhere`/`mapFieldEverywhere`, so the same code path edits both the main form and intro-modal steps.
- **Two-column layout** (`src/components/layout/AppLayout.tsx`):
  - Left sidebar (`src/components/sidebar/Sidebar.tsx`): field palette (`FieldPalette.tsx`, draggable `FIELD_TYPES` from `src/lib/fieldTypes.ts`) plus a tabbed panel for the selected field — Attributes, Validations, Styles, Logic, Almacén (`AttributesPanel`/`ValidationsPanel`/`StylesPanel`/`LogicPanel`/`LibraryPanel`). Logic tab currently edits `logic.typeScript` as plain text and dependencies as field-id toggles (no Monaco editor yet).
  - Right canvas (`src/components/canvas/Canvas.tsx`): 12-column grid drop targets (`@dnd-kit` `useDroppable` per row, one row = one 12-col grid). `CanvasTabs` switches `activeCanvas` between "Formulario" and each intro-modal step, with controls to add/remove steps; each row has a remove button and there's an "+ Agregar fila" control. Row column-count (`CanvasRow.columns`) and per-field drag-resize of `colSpan` are not implemented — `colSpan` is only settable via the Attributes panel.
  - Drag-and-drop wiring (palette → row, library component → row) lives in `App.tsx`'s `DndContext`/`handleDragEnd`.
- **Persistence** (`src/hooks/useAutosave.ts`, `src/lib/persistence.ts`): autosaves the store to `localStorage` every 5 minutes once setup is complete; `loadDraft`/`clearDraft` back the recovery prompt.
- **Output** (`src/lib/exportForm.ts`): `downloadFormExport`/`buildFormExport` serialize `projectMeta`, `setupConfig.introModal`, and `formSchema.steps[0].rows[].fields[]` (with `colSpan`, `styles`, `validations.zodSchema` generated per-field by `src/lib/zodSchema.ts`, and `logic`) into one downloadable JSON file, matching the shape documented in `docs/Project.md`.

### Prescribed stack (from spec, already in package.json)

- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` for building/validating generated form fields (Zod schemas are authored dynamically per-field and stored as part of the field config, e.g. `"z.number().min(0)"`)
- `zustand` for the canvas/builder state tree
- Tailwind v4 (via `@tailwindcss/vite`) for all styling — no CSS-in-JS
- `uuid` for generating field/row/step ids
