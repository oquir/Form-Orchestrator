# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder described below is implemented. `docs/Project.md` (in Spanish) is the original product spec — still the reference for the target JSON schema shape and any unimplemented details; check it before adding features so structure matches the intended data model.

Not yet implemented / known gaps:
- No Monaco-style code editor for the Logic tab — `LogicPanel` edits `logic.typeScript` as a plain string. (Conditional enabling *is* implemented separately via `enableWhen` + `ConditionEditor`; `logic.dependencies` remains a plain field-id toggle list.)
- No test runner configured, and none will be added: the user considers the project too volatile to justify tests right now.
- `logic.typeScript` is exported as a raw string; the consumer will need `new Function()`/`eval` to execute it. The user builds the consumer too, so this is a coordinated decision — not a public API constraint.
- No draft schema versioning in `persistence.ts`; if the store shape changes, old localStorage drafts can silently break.
- Three gaps against the real ICA API contract (`DeclaracionIcaE`, documented in the README): no **repeatable groups** (the `actividades[]` array has no representation in `rows → fields`), no **`apiPath` per field** to say which nested API property a field feeds, and no **options for `select`** (only `toggle_group` and `radio_group` have `options[]`, and nothing points at a remote catalog endpoint).

## Zone placement (Shift / Shift+Ctrl while dragging)

Holding **Shift** while dragging highlights every column of the target row (`RowZoneOverlay`) so you pick the exact start column; the field keeps its width. **Shift+Ctrl** anchors the start at the column where Ctrl was pressed and lets the pointer set the end, so the width follows the selection. Modifiers are read live mid-drag and apply to new fields from the palette and the Almacén too, not only to fields already on the canvas.

`CanvasField.colStart` holds the position (1-based, matching CSS grid line numbers) and **ships in the exported JSON**, so the consumer has to read it or layouts will not survive the round trip. The rules live in `src/lib/rowLayout/` as pure functions (`getFreeRuns`, `findNearestFit`, `resolvePlacement`, `getMaxSpanAt`, `repackRow`, `migrateRows`); keep that file free of React and store imports so it stays verifiable on its own. `loadDraft` migrates pre-`colStart` drafts by turning each overflowing visual line into a real row.

Settled decisions — do not re-litigate them without asking:

- **Collision is resolved by magnetic snap, never by pushing.** If the target range overlaps a neighbour, the preview slides to the nearest valid gap; if nothing fits, it goes red and the drop is rejected. A field the user is not dragging is never moved.
- **Holes are preserved.** Deleting or moving a field leaves its gap; every position is explicit. The one exception is `updateRowColumns`, which re-packs, since resizing a row is a deliberate layout change.
- **One row is one visual line — rows do not overflow to a second line.** A full row rejects a dropped field instead of wrapping. The user **deliberately kept the restriction** after testing it — the intended workflow is to add another `CanvasRow` and place the field there. It is a guardrail, not a bug. Implementing real multi-line rows would require a line index in the model and would turn every placement rule two-dimensional; the cheap alternative (auto-creating a row below on overflow) was offered and declined. Only revisit if the user explicitly asks.

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

### File layout conventions

Components follow **atomic design**: `src/components/atoms|molecules|organisms/`, plus `src/components/layout/`. Panels live under `organisms/panels/`. Each component and hook gets its **own folder** with co-located files — `X/X.tsx`, `X/X.types.ts`, `X/X.constants.ts`, `X/X.utils.ts` (only the ones it needs). Hooks follow the same pattern in `src/hooks/useX/useX.ts`. Shared types live in `src/types/`, shared constants in `src/constants/`, and libs in `src/lib/<name>/<name>.ts`. When adding anything, match this shape rather than dropping a loose file in a shared folder.

### Pieces

- **Setup wizard** (`src/components/organisms/SetupWizardModal/`, logic in `src/hooks/useSetupWizard/`): 2-step modal shown when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads `getIndustriaComercioTemplate()` (`src/lib/baseTemplate/baseTemplate.ts`) as the first step's rows; the other two types start from a single blank row. Step 2 asks whether an intro modal is needed and, if so, how many steps — this seeds `introModal.steps`. `DraftRecoveryModal` (`src/components/organisms/DraftRecoveryModal/`) runs before the wizard on mount if `loadDraft()` finds a saved draft.
- **State** — single Zustand store, `src/store/formStore.ts` (`useFormStore`), typed by `src/types/formStoreTypes.ts` + `src/types/storeTypes.ts`. Holds:
  - `formSteps[]` — the main form is **multi-step**; each `FormStep` has `stepId`, `title`, optional `subtitle`, and its own `rows`.
  - `introModal.steps[]` — same shape, for the intro modal.
  - `activeCanvas`: `{type: "formStep" | "introStep", stepId}` — which canvas is being edited.
  - UI state: `selectedFieldId`, `isSidebarOpen`, `sidebarTab`, `isDarkMode` (persisted to `localStorage` under `form-orchestrator-theme`), `lastSavedAt`.
  - `savedComponents` ("Almacén de Partes") and `setupConfig`.
  - Selector helpers exported alongside: `getActiveRows`, `findFieldById`, `getAllFields`, `findRowContainingField`.
  - Row/field mutations apply uniformly to whichever canvas holds the target id via `mapRowEverywhere`/`mapFieldEverywhere`, so one code path edits both form steps and intro-modal steps. Notable actions: `addFieldToRow`, `moveField` (reorder/move across rows, honoring a `beforeFieldId` insertion point), `removeField` (also clears any `enableWhen` pointing at it), `updateField`, `updateFieldValidations/Styles/Logic/FileConfig`, `addFieldOption`/`removeFieldOption`/`updateFieldOptionLabel`, `setFieldEnableWhen`, `toggleFieldDependency`, `addRowToActiveCanvas`, `updateRowColumns`, `removeRow`, `addFormStep`/`removeFormStep`/`updateFormStepTitle`/`updateFormStepSubtitle` (and the `IntroModalStep` equivalents), `saveFieldAsComponent`/`addSavedComponentToRow`/`removeSavedComponent`, `restoreDraft`.
- **Field model** (`CanvasField` in `src/types/storeTypes.ts`): `type`, `label`, `colSpan`, `validations`, `styles`, `logic`, plus optional `title`, `options[]` (toggle groups), `fileConfig`, `alwaysDisabled`, and `enableWhen` — a `{fieldId, operator, value}` condition with operators `equals | notEquals | greaterThan | lessThan | isEmpty | isNotEmpty | isTruthy | isFalsy`. Field types come from `FIELD_TYPES` in `src/constants/fieldTypes.ts` (text, number, select, textarea, checkbox, calculated, file, toggle_group, radio_group).
- **Grid**: `src/constants/grid.ts` — `GRID_BASE_COLUMNS = 16` is the default per-row column count; rows carry their own `columns` (clamped to `MIN_ROW_COLUMNS`…`MAX_ROW_COLUMNS`, 1–24) and shrinking a row clamps each field's `colSpan` to fit.
- **Two-column layout** (`src/components/layout/AppLayout.tsx`):
  - Left sidebar (`organisms/Sidebar/`): an icon rail (`SidebarTabRail`, includes the dark-mode toggle; clicking the active tab collapses the panel) over a tabbed panel — Campos, Atributos, Validaciones, Estilos, Lógica, Almacén (`FieldPalette` + `panels/AttributesPanel|ValidationsPanel|StylesPanel|LogicPanel|LibraryPanel`). `ConditionEditor` (driven by `src/hooks/useConditionEditor/`) edits `enableWhen`; `FileOptionsEditor`, `ToggleGroupOptionsEditor`, and `RadioGroupOptionsEditor` handle type-specific config.
  - Right canvas (`organisms/Canvas/Canvas.tsx`): grid drop targets (`@dnd-kit` `useDroppable` per row, one row = one grid). `CanvasTabs` switches `activeCanvas` across form steps and intro-modal steps with add/remove controls; `StepTitleEditor` edits the active step's title/subtitle; `RowColumnsMenu` changes a row's column count and `FieldResizeHandle` + `src/hooks/useFieldResize/` drag-resizes `colSpan`; `FieldContextMenu` (right-click, via `src/hooks/useFieldContextMenu/`) offers per-field actions. The header carries `SaveButton`, a "Ver JSON" toggle rendering `JsonPreviewCanvas` (live export preview, built from the `atoms/Json*` primitives), and "Exportar JSON". The intro-modal canvas renders inside a decorative fake-modal frame.
  - Drag-and-drop wiring (palette → row, library component → row, canvas field → row) lives in `src/hooks/useDragAndDrop/`; `App.tsx` only wires `DndContext`/`DragOverlay`. Dropping a `toggle_group` or `radio_group` from the palette opens `AddOptionsFieldModal` first to ask for title/option count.
- **Persistence** (`src/hooks/useAutosave/`, `src/lib/persistence/persistence.ts`): autosaves to `localStorage` on an interval once setup is complete; `src/hooks/useKeyboardShortcuts/` binds Ctrl/Cmd+S to the same save. `loadDraft`/`clearDraft` back the recovery modal.
- **Output** (`src/lib/exportForm/exportForm.ts`): `downloadFormExport`/`buildFormExport` serialize `projectMeta`, `setupConfig.introModal`, and `formSchema.steps[].rows[].fields[]` (with `colSpan`, `styles`, `validations.zodSchema` generated per-field by `src/lib/zodSchema/zodSchema.ts`, `logic`, `options`, `fileConfig`, `alwaysDisabled`, `enableWhen`) plus `formSchema.gridBaseColumns`, into one downloadable JSON file — the shape documented in `docs/Project.md`.

### Prescribed stack (from spec, already in package.json)

- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` for building/validating generated form fields (Zod schemas are authored dynamically per-field and stored as part of the field config, e.g. `"z.number().min(0)"`)
- `zustand` for the canvas/builder state tree
- Tailwind v4 (via `@tailwindcss/vite`) for all styling — no CSS-in-JS; dark mode is class-based (`document.documentElement.classList.toggle("dark", …)` in `App.tsx`), so every new surface needs its `dark:` variants
- `uuid` for generating field/row/step ids
- `reicon-react` for icons (not lucide/heroicons)

### Code style

- **No JSDoc / doc-comments.** Explain the why in the commit message, not above the function.
- **Explicit type annotations** on local declarations (`const isIntro: boolean = …`), matching the existing files.
- Biome conventions win over `eslint.config.js` (which isn't wired into a script).
