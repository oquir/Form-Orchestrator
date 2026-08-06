# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder described below is implemented, including the eight-step Industria y Comercio template, repeatable groups, the formula/rules engine, the presentational field types and the **simulator** — a working prototype of the consuming app that runs the exported JSON. `docs/Project.md` (in Spanish) is the original product spec — still the reference for the target JSON schema shape and any unimplemented details; check it before adding features so structure matches the intended data model.

Not yet implemented / known gaps:
- No Monaco-style code editor for the Logic tab — `LogicPanel` edits `logic.typeScript` as a plain string. Everything else in that tab (formula, rules, conditions) has real UI.
- No test runner configured, and none will be added: the user considers the project too volatile to justify tests right now. Verification is done with throwaway `bun run` scripts in the scratchpad.
- `logic.typeScript` is exported as a raw string; the consumer will need `new Function()`/`eval` to execute it. The user builds the consumer too, so this is a coordinated decision — not a public API constraint.
- No draft schema versioning in `persistence.ts`; if the store shape changes, old localStorage drafts stop validating. Repeatable groups already changed that shape, and so did `labelFor` / `content`. `loadDraft` returns a `DraftLoad` — `empty | invalid | ok` — so a draft that fails Zod is **discarded, deleted from `localStorage` by `useDraftRecovery`, and reported** in the setup wizard, instead of being silently lost. The loss is still real; it is no longer silent. Zod validates *shape*, not coherence: `colSpan: -999`, a `dataSource` on a `text` field or a dangling `labelFor` all still pass.
- `validations.pattern` is not validated where it is authored. Since the injection fix it can no longer execute anything, but an invalid regex now throws `SyntaxError` in the consumer when it builds the schema. A `try { new RegExp(value) } catch` in `ValidationsPanel` would catch it where it is written.
- **Two catalog-fed selects still sit on the path-inference fallback:** `periodo_anio` and `clasificacion_contribuyente` (plus the `tipo_representante` toggle). `CATALOGS` declares nine names — `departamentos`, `municipios`, `tipos_documento`, `tipos_persona`, `periodos_anuales`, `tipos_declaracion`, `tipos_sancion`, `juegos_permitidos`, `actividades` — and the template wires `dataSource` on eight fields. **The catalog ids are contract names the consumer translates to endpoints and have not been agreed with them yet**; renaming one later is a one-line change here but a breaking change there. Three are declared with no field pointing at them: `tipos_persona` (the `contribuyente.idTipoPersona` leaf exists but the template never captures it — and note the endpoint is `ListaTipoPersonaNoConvencional`, i.e. consorcio/patrimonio autónomo, **not** natural vs jurídica), `tipos_sancion` and `juegos_permitidos`. Related and still open: `FieldOption` carries `{id, label}` where `id` is a uuid, so a manually-authored option has no catalog id to send.
- **Renglón 35 (`valor_a_pagar`) has no formula**, so the liquidation chain breaks there: renglón 33 computes a total that 38 never picks up. The user has not yet said how 35 is derived. Proposed but unconfirmed: `formula: "total_saldo_a_cargo"`.
- Selects mapped to `number` leaves show a permanent **`⚠ tipo`** warning (`periodoAnio`, `idPeriodoAnual`, `idTipoDeclaracion`, `tipo_documento`, `municipio`, `clasificacion_contribuyente`, the `search_select` for actividad). A two-line fix in `fieldMatchesSchemaType` — letting option-based types match `number` — has been offered and not yet approved.
- **The simulator ignores `field.styles` entirely.** The export carries them (`styles: field.styles` in `mapRows`) and `CanvasFieldChip` applies all five, but grepping `.styles` under `components/organisms/preview/` returns nothing: the simulator draws generic controls. So a field styled yellow is yellow on the canvas and grey in the simulator, which undercuts the "faithful consumer" premise. The four that go through `style={{}}` (`marginTop`, `marginBottom`, `backgroundColor`, `textColor`) are a short, safe fix. `customClasses` is not — see the next entry.
- **`styles.customClasses` only works by accident, and the consumer will hit the same wall.** Tailwind v4 scans **source files** at build time. A class typed into the "Clases CSS" input lives in `localStorage` and in the exported JSON, never in the source, so it is emitted only if some component already happens to use it. Measured against the built CSS: `font-bold`, `text-right` and `uppercase` exist; `bg-purple-700`, `tracking-widest` and `text-2xl` do not. There is no safelist and no `@source` directive in `index.css`. It fails **partially**, which is the worst mode — half the classes work, so the bug reads as something else. `tooltip.customClasses` has the identical problem. Fixing it is a product decision rather than a patch: either a Tailwind safelist over an agreed set of classes, or replacing the free-text input with a picker. Both force a call on what an author may restyle, and that call is cheaper now than after the consumer exists.

## Zone placement (Shift / Shift+Ctrl while dragging)

Holding **Shift** while dragging highlights every column of the target row (`RowZoneOverlay`) so you pick the exact start column; the field keeps its width. **Shift+Ctrl** anchors the start at the column where Ctrl was pressed and lets the pointer set the end, so the width follows the selection. Modifiers are read live mid-drag and apply to new fields from the palette and the Almacén too, not only to fields already on the canvas.

`CanvasField.colStart` holds the position (1-based, matching CSS grid line numbers) and **ships in the exported JSON**, so the consumer has to read it or layouts will not survive the round trip. The rules live in `src/lib/rowLayout/` as pure functions (`getFreeRuns`, `findNearestFit`, `resolvePlacement`, `getMaxSpanAt`, `repackRow`, `migrateRows`); keep that file free of React and store imports so it stays verifiable on its own. `loadDraft` migrates pre-`colStart` drafts by turning each overflowing visual line into a real row.

Settled decisions — do not re-litigate them without asking:

- **`dragPlacement` is written only when it actually changes.** `recomputePlacement` runs on every `pointermove` — ~100/s — and almost always recomputes the same thing, but a store write creates a new state object and forces every subscriber to re-run its selector. `applyPlacement` compares by value first (`samePlacement`, since the recomputed object is always a fresh instance). Measured: a 120-move drag across 6 columns went from 120 writes to 6. The refs in this hook exist for the same reason; the write was the one that slipped through.
- **Collision is resolved by magnetic snap, never by pushing.** If the target range overlaps a neighbour, the preview slides to the nearest valid gap; if nothing fits, it goes red and the drop is rejected. A field the user is not dragging is never moved.
- **Holes are preserved.** Deleting or moving a field leaves its gap; every position is explicit. The one exception is `updateRowColumns`, which re-packs, since resizing a row is a deliberate layout change.
- **One row is one visual line — rows do not overflow to a second line.** A full row rejects a dropped field instead of wrapping. The user **deliberately kept the restriction** after testing it — the intended workflow is to add another `CanvasRow` and place the field there. It is a guardrail, not a bug. Implementing real multi-line rows would require a line index in the model and would turn every placement rule two-dimensional; the cheap alternative (auto-creating a row below on overflow) was offered and declined. Only revisit if the user explicitly asks.

## Repeatable groups (`actividades[]`)

A repeatable group is a **marker on the row**, not a nested container: `CanvasRow.groupId` points at a `RepeatableGroup` held in `FormStep.groups[]` (`src/types/formStructure.ts`). `IntroModalStep` has no `groups` — the intro modal cannot hold one.

This shape was chosen because `useDragAndDrop` resolves everything by `rowId` and never inspects row contents, so **drag & drop, `rowLayout`, resize and every placement rule keep working inside a group with no changes at all**. That satisfies the user's explicit requirement that the fields of an activity stay freely movable and reorderable. The cost is that contiguity is not structural — `normalizeGroupRows` has to pull a group's rows back together by hand after any mutation that could scatter them.

Helpers live in `src/lib/repeatableGroup/repeatableGroup.ts`: `createRepeatableGroup`, `clampGroupBounds`, `groupRows`, `groupFields`, `findGroupIdForRow`, `findGroupIdForField`, `findGroupById`, `normalizeGroupRows`, `pruneEmptyGroups`, `detachGroup`, `groupNamesInUse`. Bounds default to `DEFAULT_GROUP_MIN = 1` / `DEFAULT_GROUP_MAX = 15` (the ICA rule) and are clamped to `MIN_GROUP_ITEMS = 0`…`MAX_GROUP_ITEMS = 99`, since other form types need different limits.

Settled decisions:

- **A group's `arrayPath` is absolute** (`actividades[].idActividad`), not group-relative. One namespace means `resolveLeaf`, duplicate detection and the mapping tree need no special cases.
- **Moving a field out of a group clears its `apiBinding`.** `moveField` compares the source and target `groupId`; a path scoped to the array item is meaningless outside it. Changing a group's `arrayPath` via `updateGroup` clears its members' mapped bindings for the same reason.
- **Deleting a group's last row deletes the group** (`removeRow` wraps steps in `pruneEmptyGroups`). `removeGroup` does the opposite: it keeps the rows and only strips their `groupId`.

UI: `RepeatableGroupBand` (`organisms/`) draws the band with title, min/max, `arrayPath` select, "+ Fila" and a dissolve button, wrapping a nested list of `CanvasRow`. `CanvasRowsGrid.utils.ts` turns the flat row list into blocks via `toCanvasBlocks`, and `CanvasAddGroupButton` creates one.

## Formulas and rules (`logic.formula`, `logic.rules`)

`src/lib/formula/formula.ts` is a small self-contained arithmetic language — tokenizer plus recursive descent, no `eval`. Public API: `parseFormula` (returns `{ast, error}`, **never throws**), `collectFormulaRefs`, `validateFormula`, `toFormulaNumber`, `evaluateFormula`. Keep it free of React and store imports.

- Functions (`FORMULA_FUNCTIONS` in `src/constants/formula.ts`): `abs`, `min`, `max`, `sum`, `round` (1–2 args), `floor`, `ceil`.
- Aggregates (`FORMULA_AGGREGATES`, same file): `sumOf(campo)` and `countOf(campo)` take **a bare field name, not an expression** — they read a repeatable group's column. `sumOf(1 + 2)` is a parse error on purpose.
- Semantics: a missing, empty or non-numeric ref is `0`; division by zero yields `null`, which propagates through the whole expression.

`FieldRule` (`src/types/field.ts`) is `{id, label?, matchAll, when: RuleCondition[], effects: RuleEffect[]}`, where an effect is either `{kind: "formula", expression}` or `{kind: "constant", value}`. Conditions and effects **carry their own `id`** so lists can be keyed and reordered without index keys. Helpers are in `src/lib/fieldRule/fieldRule.ts`; the UI is `panels/FieldRulesEditor` driven by `src/hooks/useFieldRules/`.

`src/lib/fieldGraph/fieldGraph.ts` unifies **six** edge sources into one dependency graph: `visibleWhen`, `enableWhen`, `rules[].when[]`, refs inside rule formulas, refs inside `logic.formula`, and `logic.dependencies`. Formula refs are field *names*, so `buildNameToIdIndex` normalizes them to ids. `logic.typeScript` is deliberately excluded — it is an opaque string the builder cannot parse. `topologicalOrder` returns `{order, unresolved, cycle}` and never throws; `wouldCreateCycle` backs the editors' guard rails.

Settled decisions:

- **`evaluationOrder` is not exported.** It was added to `formSchema` and then removed: measured against the ICA template it came out byte-identical to document order, and it silently appended cycle members to the end, so a consumer had no way to know the order was invalid. The consumer already has to parse formula strings to evaluate them, so building the graph itself is marginal extra work. Do not re-add it without also surfacing cycles.

## Presentational fields (`label`, `rich_text`)

Fields split into two classes. **Input fields** collect a value; **presentational fields** only show content. The predicate is `isPresentationalField` in `src/lib/fieldKind/fieldKind.ts`, backed by `PRESENTATIONAL_FIELD_TYPES` — use it rather than comparing types inline, so the panels, the schema builder and the export can't drift apart.

A presentational field **keeps** its `colStart`/`colSpan`, its `styles` and its `visibleWhen` (hiding a legal notice along with the field it accompanies is legitimate). It **loses** validations, payload mapping, `enableWhen`, formula and rules, and it never appears as a condition, dependency or formula candidate — there is no value to observe. `LogicPanel` short-circuits to just the visibility editor for them.

### `label` — an external label bound to a field

The link lives **on the label**: `CanvasField.labelFor` points at the input field. One owner, so there are no two ends to keep in sync, and it mirrors how `enableWhen` points outward. The rule "a field with a linked label has no label of its own" is **derived, never stored** — `hasLinkedLabel(fields, id)` computes it.

Deriving it is O(n) per question, which is why **`CanvasRowsGrid` builds the index once and drills a `linkedLabels: Map` down through `CanvasRow` and `RepeatableGroupBand`** (`buildLinkedLabelIndex`, keyed by the *target* field's id). Each chip used to subscribe to `getActiveRows` and rebuild the whole field list to answer for itself — n chips × O(n), measured at 16.9× the necessary work on a 15-field step. The index keeps `findLabelFor`'s first-wins tie-break so a hand-edited draft with two labels on one target answers identically. `AttributesPanel` still calls `findLabelFor` directly: one field, one question, no loop.

Invariants the store maintains:

- **1:1** — `setFieldLabelFor` unlinks any other label already pointing at that target.
- **No dangling refs** — `removeField` clears `labelFor` alongside `enableWhen`/`visibleWhen`/rules. Deleting the target leaves the label alive but unlinked, matching the "holes are preserved" rule; it is not deleted for the user.
- **`labelTargetCandidates`** offers only free input fields, plus that label's current target so the selection does not drop out of the list.

`SavedComponent` deliberately has no `labelFor`: dropped into another canvas it would carry a reference to an id that does not exist there.

The linked field **keeps `field.label` in the model** even though nothing renders it — `name` is derived from it, and `ConditionFieldSelect`, `FormulaInput`, `FieldContextMenu` and the sidebar all use it to name the field. Making it optional would touch eight call sites for no gain. The canvas shows the *linked label's* text in muted italics instead of a blank, so the preview still resembles what the taxpayer sees.

### `rich_text` — a formatted content block

Standalone; it is never bound to an input. Supports bold, italic, underline and links — no lists, no headings.

**Content is stored structured, never as an HTML string** (`RichTextContent` in `src/types/richText.ts`): `[{ type: "paragraph", children: [{ text, bold?, italic?, underline?, href? }] }]`. The consumer renders it with components and never needs `dangerouslySetInnerHTML`. An HTML blob would have turned the exported JSON into executable markup — the same class of problem as the `validations.pattern` injection. Do not "simplify" this to HTML.

**The serializer is the sanitizer.** `serializeRichText` (`src/lib/richText/`) walks the DOM with a whitelist: it honours `b/strong/i/em/u/ins/a/br`, drops the whole subtree of `script`/`style`/`iframe` and friends, and flattens every other tag to plain text. It also reads inline `font-weight`/`font-style`/`text-decoration`, because pasting from Word delivers formatting as styled spans and the whitelist alone would discard it. This is what makes pasting from anywhere both safe and useful.

**Link policy** — `safeHref` allows only `http:`, `https:` and `mailto:`, and prefixes `https://` when no scheme is given. It runs at three points: inserting in the editor, serializing, and **again when loading the draft**, since `localStorage` is editable from devtools. Keep all three.

The editor is a `contentEditable` with its own toolbar and no new dependency. It paints the model by creating nodes, never via `innerHTML`, and repaints **only on mount** — repainting on every change would send the caret to the end mid-typing, so the panel passes `key={field.id}` to remount on field change. The selection is saved before the URL input opens and restored on apply, since moving focus loses it. Three lint suppressions are annotated in place: a `textarea` cannot carry inline formatting, and the mount effect cannot depend on `value`.

## Simulador (`FormSimulator`) — el consumidor de mentira

Renders the form as the taxpayer would see it. It is not a mock: it is a working prototype of the consuming app, living inside the builder.

**It is a full-screen mode, not a canvas view.** `isSimulatorOpen` lives in the store (next to `isSidebarOpen`) and `FormBuilder` returns `<FormSimulator />` early when it is on, so the sidebar, the canvas and the whole `DndContext` unmount — the simulator gets the entire viewport with no builder chrome. The entry point is a button beside "Exportar JSON"; it is deliberately *not* one of the `VIEW_MODE_TABS`, because those swap the canvas body while this replaces the app. `useAutosave` and the keyboard shortcuts live in `App`, above `FormBuilder`, so they keep running while the simulator is open. The header carries its own dark-mode toggle, since the sidebar rail that normally owns it is gone.

**The single rule that makes it worth anything: it consumes `buildFormExport(...)` and never touches `useFormStore`.** `useFormPreview` is the only place the store is read, and it reads it solely to feed `buildFormExport`. If the simulator can't do something, the real consumer can't either — that is the point. Everything is keyed by field **name**, because the export already resolved ids to names.

Layers, all React-free and benchmarked at ~1 ms per keystroke for the full ICA form with 15 activities:

- `lib/formRuntime/` — `buildRuntimeModel(export)` flattens the export into name indexes; `resolveRuntime(model, state)` returns a `RuntimeSnapshot` with a `root` scope plus one scope per repetition of each group.
- `lib/runtimeCondition/` — **`evaluateCondition`**, the executor for the 13 operators. It did not exist before: the builder only ever *authored* conditions. Shared by visibility, enablement and rule matching.
- `lib/runtimeFormula/` — resolves `logic.formula` and `logic.rules` in topological order over field names (`planDerivedFields`), reusing `parseFormula`/`evaluateFormula`. Formula first, then rules override in list order.
- `lib/runtimePayload/` — walks `apiBinding.path` to assemble the real `DeclaracionIcaE` object, expanding `[]` to the repetition index.
- `lib/zodHydrate/` — `new Function("z", ...)` over `validations.zodSchema`.
- `lib/mockCatalog/` — the options a catalog-fed select offers, resolved in three tiers: `MOCK_CATALOGS` keyed by a declared `dataSource.catalog`, then `MOCK_BY_LEAF` keyed by the payload leaf the field is mapped to, then `placeholderOptions` as a last resort. **All of it is simulator-only and none of it is exported** — verified by grepping the built JSON for the fake labels. `MOCK_BY_LEAF` exists because the ICA template's conditions compare against **real catalog ids**: without a `tipo_documento` option whose id is literally `"2"`, persona jurídica was unreachable in the simulator, so `visibleWhen` on razón social and the whole `dvNit` rule could never fire. Fake data that doesn't match the real ids makes the simulator lie in the one direction that matters.
  - **`mockCatalog.data.ts` is generated, not authored.** Nine catalogs (1601 entries — 1119 ciudades, 425 actividades) transcribed verbatim from dumps of the real endpoints. The ids and labels are the API's, warts included — `CUNDINAMARCA` appears twice (ids 3 and 11, where 3 holds only BOGOTÁ), `V ALLE DEL CAUCA` ships with the split word, `CORECCIÓN` is misspelled in two catalogs, and every label is uppercase. **Do not tidy them**: the point is that a condition written against a real id or label works here exactly as it will in the consumer. Regenerate rather than hand-edit if a new dump arrives.
  - Departamentos/ciudades are keyed by the API's own `idDepartamento` (1–33) and `idCiudad` (1–1119), **not** DANE codes — the earlier hand-written subset used DANE and was replaced. `TIPO_DOCUMENTO_NIT = "2"` survives the swap because the real catalog also numbers NIT as 2; that was luck, not design, so re-check it against any future dump.
  - **The actividades dump has a different shape and one open question.** Each row is `{idDeclaracion, codigoCIIU, descripcion, tarifaXMil}` — no `{success, result}` wrapper. `idDeclaracion` (30492–55326) is taken as the option id and `codigoCIIU` (130–9609) goes in `code`, on the reasoning that the template carries a **separate** `codigo_actividad` field for the CIIU, so the two cannot be the same value; the payload leaf is `actividades[].idActividad` and **nobody has confirmed which of the two it wants**. Flipping it is one line in the generator. Note the catalog's own `idDeclaracion` key collides by name with the payload's `actividades[].idDeclaracion`, which is a `providedByHost` leaf and a different thing. The dump also turned out to be a **subset**: CIIU 210 (silvicultura) shows up in the consumer and is not in these 425 rows.
  - **`CatalogOption` is `{id, label, code?, tarifa?}`** (`src/types/catalog.ts`), and `CatalogEntry` is that plus `parentId?`. The two extra columns exist because the search modal draws them apart — the code as the row's heading, the tarifa as a badge — instead of cramming them into the label. **They never reach the export**: the consumer gets them from its own endpoint, which really does return all four columns. Only actividades carries them today.
  - **The `tarifa` column is empty and that is a real gap.** The first conversion dropped `tarifaXMil` and the dump is gone, so every activity ships without it and the modal draws no badge. Two ways back, neither of which invents anything: re-run the generator over a fresh dump, or paste it in the **Catálogos** tab naming `codigoCIIU` and `tarifaXMil`. Do not fabricate tariffs to fill the hole.
  - **Nothing projects the chosen activity onto its sibling fields yet.** `codigo_actividad` and `tarifa_x_mil` stay `alwaysDisabled` and empty, so `impuesto_actividad`'s formula (`ingresos_gravados * tarifa_x_mil / 1000`) always reads 0 — the activities chain is dead in the simulator. The consumer already does it: `ActividadRowForm` in `ica-frontend-Pruebas` fills `codigo` from `codigoCIIU` and `tarifaXMil` from `tarifa` on select. Wiring it here needs a contract decision first, because the export has no way to say "copy this column into that field" — the smallest additive shape would be something like `dataSource.fills: [{column, field}]`. Not built, not agreed.
  - Still invented, because they never came in a dump: the `periodoAnio`, `idClasificacionMunicipio` and `idTipoRepresentante` entries in `MOCK_BY_LEAF`.
  - Cost: the data file adds ~93 kB raw. It no longer lands in the initial chunk — see the lazy boundary below.

Settled decisions:

- **Three passes in `resolveRuntime`, in this order:** groups with raw root values → root with the group columns exposed as arrays → groups again with the resolved root. `evaluateFormula` reads a plain `ref` as a scalar but `sumOf(campo)` expects an **array** under the same key, so the group's columns have to be flattened into the root scope for the aggregates to work. Collapse this into one pass and the ICA totals silently read `0`.
- **A scope per repetition, not one bag.** A field inside an activity resolves siblings from its own row (`{...rootValues, ...item}`), so `impuesto_actividad` computes per activity instead of reading the last one.
- **`eval` is not a shortcut, it is the contract.** `ExportedField.validations` carries **only** Zod schemas as strings — `required`, `min`, `max` and `pattern` are not exported. The consumer has no other way to validate. `hydrateZodSchema` wraps it in try/catch and surfaces the failure as a `RuntimeIssue` instead of crashing, which is also what finally makes the `validations.pattern` gap visible where it is authored.
- **`hydrateFieldSchemas` keys its map by the schema *string*, not by field name.** A field with conditional validations has more than one schema and which applies depends on what the user has typed, so a name key cannot answer. Side benefit: two fields with an identical schema share one validator.
- **`required` is sniffed from the schema string** (`isRequiredBySchema`: no trailing `.optional()`), for the same reason. `checkbox` is excluded because `buildZodSchema` never appends `.optional()` to it.
- **`logic.typeScript` is not executed.** It is arbitrary code and says nothing about whether the form is well built.
- **Preview state is local to the component tree**, never in the Zustand store — answers are throwaway and switching to another view resets them. `reconcileState` re-pads group arrays when the canvas gains or loses a group so typing isn't lost mid-edit.
- **Hidden fields are neither rendered nor validated** (`PreviewField` returns `null`, `collectErrors` skips them), matching the documented precedence.
- **Validation is per step, and it gates navigation.** There is no "validate everything" button — the form is filled step by step, so "Siguiente" (and the intro modal's "Continuar") validates only that screen and refuses to advance while it has errors; the last step's button becomes "Enviar". `stepErrorKeys(step, snapshot)` builds the keys a screen owns, expanding a repeatable group's rows to one key per repetition so `validateRuntime`'s indexing lines up. Errors are revealed per key (`revealed`), not globally, so a field you have not reached yet never shows red. The results panel still lists every error live, which is the global view.
- **`react-hook-form` is still unused.** It was installed by the spec but the hard part here is the runtime, not the state layer, and a plain value bag makes formulas-writing-back and repeatable arrays far easier to get right. Swapping the state layer later means replacing `useFormPreview`, not the libs.
- **`search_select` is a modal, `select` stays a native dropdown** (`preview/PreviewSearchSelect/`). That split is the whole reason the type exists: 425 actividades × 15 repetitions were **6.375 `<option>` nodes mounted before anyone touched the form**, and a native dropdown has nowhere to put the code and the tarifa. The trigger is a button showing `code · label`; the modal filters over code *and* description, accent- and case-insensitively (`\p{M}` over NFD), and nothing is filtered while it is closed. Escape and "Cancelar" close it, "Quitar" clears the selection. The header uses `bg-brand` — this app's orange — not the consumer's green, so the modal does not clash with the rest of the simulator.
- **The tarifa reads `4X1000`, never `4‰`.** The per-mille sign is read as a percent on screen and the two are three orders of magnitude apart. Same reason the template's field is labelled "Tarifa X1000".

**The simulator is behind a `React.lazy` boundary** in `FormBuilder`, with a `Suspense` fallback. Whoever only builds forms never downloads it. Measured on the ICA template: one 872 kB chunk became **762 kB initial + 117 kB on demand** (gzip 240 → 208).

What actually crossed the boundary is `mockCatalog.data.ts` and the `preview/` tree — **not Zod**. Verified by grepping the built chunks: the catalog labels appear only in `FormSimulator-*.js`, but `invalid_union` appears in both. Zod stays in the initial chunk because `persistence.schema.ts` and `catalogBank.schema.ts` import it eagerly — `loadDraft` and `loadCatalogBank` both run at startup. So the old note that lazy-loading "would claw back Zod" was wrong: getting Zod out needs `loadDraft` to become async and dynamic-import its schema, which ripples into `DraftRecoveryModal` and the store bootstrap. Not done.

Keep the boundary honest: any new eager import of `lib/mockCatalog/`, `lib/zodHydrate/` or `components/organisms/preview/` from the builder side silently pulls the chunk back into the initial load.

## Tooltips (`field.tooltip`)

`FieldTooltip` is `{content: RichTextContent, position: "top"|"bottom"|"left"|"right", customClasses?}`. Only eight types offer it — `TOOLTIP_CAPABLE_FIELD_TYPES` in `src/constants/fieldTypes.ts`: text, number, select, checkbox, calculated, file, toggle_group, radio_group. Use `supportsTooltip` / `hasTooltip` / `exportableTooltip` (`src/lib/fieldTooltip/`) rather than checking the type or the emptiness inline, so the panel, the canvas chip and the export can't drift apart. `AttributesPanel` renders `panels/FieldTooltipEditor` behind that predicate; the store action is `updateFieldTooltip(fieldId, updates | null)`, where `null` removes it and a partial merges onto `createEmptyTooltip()`.

Settled decisions:

- **The trigger is an ℹ icon, not the field.** Hover-on-the-field was considered and rejected: the taxpayer has no way to discover help that only appears on hover, there is no hover at all on a phone, and on a `toggle_group` the bubble would cover the options being clicked. There is no `trigger` flag — one behaviour, one code path in the consumer. The icon goes next to the **visible** label, which for a field with a linked `labelFor` is the label's text, not the field's.
- **The canvas preview is deliberately looser than the contract**: the chip shows the ℹ icon but reveals the bubble on hovering the whole field, because the bubble has to be a sibling of the chip's `<button>` to escape the label row's `overflow-x-hidden`, and because judging a position is easier without having to hit a 12px target. `group/tooltip` (not plain `group`) because the chip already uses `group` for the drag handle.
- **Content is `RichTextContent`, never a string.** The user asked for bold/italic/links, which are the formats actually requested by their stakeholders. Reusing `rich_text`'s shape means `RichTextEditor`, `RichTextView`, `serializeRichText`'s whitelist and `safeHref` all apply unchanged — including the third `safeHref` pass in `persistence.schema.ts` when a draft loads. Do not "simplify" it to HTML or to a plain string.
- **An empty tooltip is not exported.** `exportableTooltip` returns `undefined` when the type doesn't support it or the content is blank, so activating the checkbox and typing nothing leaves no trace in the JSON.
- **No per-option tooltips.** Considered and cut: a per-option tooltip is only authorable when the field owns its options, i.e. when it is *excluded* from the payload — and both `toggle_group`s in the ICA template are mapped, while `radio_group` is unused, so it would have had zero places to be used today. The design stays forward-compatible: adding `tooltip` to `FieldOption` later is purely additive, since options already travel through `exportableOptions` and `buildZodSchema` only reads `option.id`.

## Options and `apiBinding`

`select`, `search_select`, `toggle_group`, `radio_group` and `checkbox_group` (`OPTION_BASED_FIELD_TYPES` in `src/constants/fieldTypes.ts`) only get **manually authored options when the field is explicitly excluded from the payload *and* declares no `dataSource`**. Otherwise its options are injected at runtime by the consuming app. The predicates live in `src/lib/fieldOptions/fieldOptions.ts`; use `allowsManualOptions` rather than checking `apiBinding` inline, so the panel, the canvas preview, `buildZodSchema` and `buildFormExport` can't drift apart — it has exactly four call sites and they are the whole enforcement.

**Where a field's options come from — the precedence the consumer applies, in this order:**

1. `options[]` present → use them. Only ever emitted for excluded fields with no `dataSource`.
2. `dataSource` present → query `dataSource.catalog`; if it carries `dependsOn`, pass that field's current value as the parameter and offer nothing until it has one.
3. Neither, and `apiBinding.kind === "mapped"` → infer the catalog from `apiBinding.path`. Legacy fallback; most ICA selects still sit here.

**`options[]` and `dataSource` are mutually exclusive by construction**, not by convention: `allowsManualOptions` returns false whenever `dataSource` is set, which makes `exportableOptions` return `undefined` and `buildZodSchema` fall back to `z.string()` instead of freezing a `z.enum` of stale catalog values. The JSON can never carry both, so the consumer never has to break a tie.

Consequences to keep in mind:

- Dropping an option-based field from the palette creates it with **no options**. `FieldOptionsModal` (título + cantidad) fires from `ApiMappingPanel` at the moment the field is marked excluded, not on drop — **unless the field already declares a `dataSource`**, in which case excluding it asks nothing, because there is nothing to author.
- Leaving the excluded state **discards** `options` — this is deliberate, decided over keeping hidden data around. Declaring a `dataSource` discards them for the same reason (`updateFieldDataSource`); the two paths share `allowsManualOptions` so they cannot disagree.
- `buildZodSchema` only emits `z.enum([...])` for excluded fields; mapped ones fall back to `z.string()`, since the builder can't enumerate values it never sees.
- `ConditionValueInput` offers a dropdown only when the observed field has local options, so an `enableWhen`/`visibleWhen` pointing at a mapped select degrades to a free-text input where you type the catalog id by hand.
- `checkbox` and `checkbox_group` are **different types on purpose**. `checkbox` is a single boolean ("acepto los términos") — `z.boolean()`, only `isTruthy`/`isFalsy` operators, no "required" toggle. `checkbox_group` is multi-select: it carries `options[]` and its schema is `z.array(z.enum([...]))` (`MULTI_VALUE_FIELD_TYPES` drives the array wrapping). Do not merge them.
- `PAYLOAD_SCHEMA` currently has **75 leaves — 53 `number`, 22 `string`, no `boolean` and no arrays of scalars**; 3 are `providedByHost` and 5 sit inside `actividades[]`. So a `checkbox_group` has nowhere to map and will in practice always be excluded, and `fieldMatchesSchemaType` lets `checkbox` match `number` leaves (0/1) — otherwise every mapped checkbox showed a permanent, unavoidable type warning.
- `flattenLeaves` descends into arrays and stamps each item leaf with its `arrayPath`; `flattenSelectableLeaves(schema, arrayPath?)` filters by array context, so the mapping panel offers item paths only to fields that live in a group bound to that array.

### `dataSource` — which catalog feeds a field

`FieldDataSource` is `{catalog, dependsOn?}` (`src/types/field.ts`). `catalog` is a contract string the consumer maps to its own endpoint; `dependsOn` names the field whose value parameterizes the query. In the store it holds the parent's **id**; `resolveDataSource` turns it into a **name** on the way out, exactly like `labelFor`.

`dataSource` answers "where do the options come from", and `apiBinding` answers "does this value travel in the payload". **They are orthogonal, and conflating them was the original bug.** `departamento` is the proof: it is `{kind:"excluded"}` because the API only wants `idCiudad` — the municipality already implies the department — and it carries `{catalog:"departamentos"}` because its options are still a catalog query. Before the split, marking a field excluded forced the author through `FieldOptionsModal`, so "excluded but catalog-fed" was unauthorable.

Settled decisions:

- **`CATALOGS` is a closed list** (`src/constants/catalog.ts`), picked from a dropdown, never typed. Same reasoning as `apiBinding.path` being chosen from `PAYLOAD_SCHEMA`: it is a contract shared with an app the builder cannot see, and a typo'd catalog name fails silently and with no clue on the far side. Adding one is a line there plus a line in `MOCK_CATALOGS`.
- **Identifying a catalog by field `name` was rejected.** It forces the consumer to carry a list of magic names, breaks the moment a field is renamed, and does not generalize to the next dependent pair. `dataSource` is that idea made explicit in the data.
- **A `dataSource` never ships its options.** The DANE departments and municipalities in `mockCatalog.constants.ts` are simulator-only; the export carries the catalog name and nothing else.
- **A catalog with no mock data still yields placeholder options** (`placeholderOptions`), so declaring one never leaves the simulator with a dead select you cannot fill past.

### The catalog bank — real options for the simulator

`CatalogBank` is `Record<catalogId, {source, entries}>` (`src/types/catalog.ts`), edited from the **Catálogos** sidebar tab and stored under its own `localStorage` key (`form-orchestrator-catalogs`), **never in the draft and never in the export** — `exportForm` and `persistence` contain zero references to it, so the isolation is structural rather than a promise.

It is keyed **by catalog, not by field**, and that is the whole point: `departamentos` is the same catalog in the ICA form and in retención, so loading it once serves every form. Per-field storage would have forced re-entering it per form, and that is what makes a "copy options from one simulator to another" button look necessary — it is a symptom of the wrong unit, and it does not exist here.

Settled decisions:

- **Options are pasted, not typed.** `parseCatalogPaste(raw, keys)` takes an endpoint response verbatim: it digs out the first array inside a `{data:[…]}`-style wrapper, and the author names the columns via `CatalogPasteKeys` (`{id, label, parent?, code?, tarifa?}` — an object because five positional params, four of them optional, are unreadable). Typing 1.100 municipios row by row is not a workflow anyone completes. `code` and `tarifa` are only read by the `search_select` modal; a tarifa that does not parse as a number is dropped rather than stored as `NaN`.
- **The bank wins whole, or not at all.** If a catalog is active (`usesCustomCatalog`), it is used even when the parent filter yields nothing. Falling back to mock data for an unloaded parent would mix real and fake options in one dropdown.
- **Which data to use is a per-catalog switch, not a prompt.** Each catalog is `default` or `custom`, and flipping to `default` **keeps** the pasted entries rather than discarding them — testing against the small fake set should not cost you the JSON you pasted. A modal asking "default or custom?" on entering the simulator was proposed and rejected: it would be a global answer to a per-catalog question, annoying if it fired every time and an unfindable hidden preference if it fired once. State you can see and flip beats a question you answer and forget.
- **`isSimulatedCatalog` takes the bank**, because the warning has to be true: before this it kept saying "Catálogo simulado" under a field already showing the 33 real departments loaded from the endpoint. That badge is where an author actually finds out which data they are looking at — which is the discoverability problem the rejected modal was reaching for, solved at the point of use.
- **No HTTP.** Connecting the simulator to the real catalog endpoints was considered and deferred: it buys real data at the cost of CORS, auth, and a simulator that stops working offline. Pasting gets the same data with none of that, and the bank is the structure a URL fetch would fill later anyway.

## Conditional validations (`validations.overrides`)

A field's validation can change with another field's value. `FieldValidationOverride` is `{id, when: FieldCondition, validations: FieldValidationRules}` (`src/types/field.ts`), and `FieldValidations` is the same rules plus `overrides?[]`. `FieldValidationRules` exists separately from `FieldValidations` **so an override cannot nest overrides** — one layer, no recursion to resolve.

On the way out (`resolveValidations` in `exportForm.utils`) it becomes `validations: {zodSchema, zodSchemaWhen?: [{when, zodSchema}]}`. **The consumer walks `zodSchemaWhen` in order and takes the first whose condition holds; if none do, `zodSchema`.** `effectiveSchemaSource` is that rule, and both `collectErrors` and the required asterisk go through it, so the simulator can't drift from what the consumer must do.

The motivating case is in the ICA template: `numero_documento` accepts 7–10 digits, but 7–9 when `tipo_documento` is NIT, because the tenth digit is the DV and that lives in its own field. Three fields carry it — contribuyente, declarante and responsable — and each observes **its own** `tipo_documento` select, which is why `nitOverride(name)` takes the observed field's name.

Settled decisions:

- **An override merges onto the base, it does not replace it.** `mergeValidationRules` skips keys that are `undefined`, so an override declaring only `pattern` keeps the base's `required` and `message`. Writing an empty input in the panel clears the key rather than storing `0` or `""`, which is what makes "inherit" the default.
- **The alternative was two fields swapped by `visibleWhen`**, both bound to the same payload leaf. Rejected: it works today (hidden fields are neither validated nor sent) but it doubles three fields into six, and `buildPathIndex` is a `Map` keyed by path, so the payload view would silently show only one of each pair. Cross-field validation is the thing being modelled; the field count should not be the place it shows up.
- **Overrides are not edges in `fieldGraph`.** A validation override observes a field but no value flows through it, so it cannot take part in a cycle. `removeField` still prunes them (`pruneOverridesReferencing`), and an override pointing at a deleted field is dropped whole — half an override would apply always, which is the opposite of what was written.
- **`persistence.schema.ts` had to learn the shape.** `z.object` strips unknown keys, so without that branch a draft with overrides would have lost them silently on load. Any future addition to `FieldValidations` needs the same line.

## Conditions (`visibleWhen` / `enableWhen` / `alwaysDisabled`)

A field carries two independent `FieldCondition`s. `visibleWhen` decides whether it **renders at all**; `enableWhen` decides whether it is **editable**. They share the type, the operators, the store shape and the whole `ConditionEditor` / `useConditionEditor` machinery — the `kind: "enable" | "visible"` param is the only difference, and it picks which field is read and which setter is called.

Operator semantics live in `src/lib/fieldCondition/fieldCondition.ts` and are shared by the editor, the export and the graph: `operatorNeedsValue`, `operatorTakesList`, `operatorIsStringBased`, `parseConditionList`, and `operatorsForFieldType`, which narrows the offered list per field type (a `checkbox` only gets `isTruthy`/`isFalsy`, a `file` only gets `isEmpty`/`isNotEmpty`, and so on). Use these rather than re-deriving the rules inline.

Precedence the consuming app must apply, in this order:

1. `visibleWhen` false → the field is **not rendered and not validated**. Nothing below applies.
2. `alwaysDisabled` → rendered, read-only.
3. `enableWhen` false → rendered, disabled.

Settled decisions:

- **A hidden field's Zod schema is exported unchanged.** `buildZodSchema` knows nothing about `visibleWhen`, so a `required` + hidden field still exports `z.string().min(1)`. The consumer must drop hidden fields from the resolver — the builder deliberately does not weaken the schema, because when the field *is* visible the requirement is real. Same coordinated-consumer arrangement as `logic.typeScript`.
- **Visibility is editable even when `alwaysDisabled` is on** (the enable editor is not — it is hidden, as before). Hiding a read-only field is a legitimate combination.
- `wouldCreateCycle` walks **every** edge kind, not just conditions. A cycle can span condition and formula edges (`A.visibleWhen → B`, `B.formula → A`), and a checker that follows only one would not see it.
- The candidate list in `LogicPanel` comes from `formSteps` only, so **a form-step field cannot condition on an intro-modal field** (or vice versa). Not a decision so much as an untouched limit — revisit if someone needs it.

## Commit conventions

- Write commit messages **in Spanish**, present tense, imperative ("Agrega X", "Corrige Y", "Amplía Z") — matches the existing history style (`git log`).
- Keep the subject line under ~72 chars and specific ("Agrega campo Archivo con presets de formatos" beats "Nuevo campo").
- **Keep bodies short — three or four lines at most, and often none.** The user asked for this explicitly: long explanatory bodies were getting in the way. Say the *why* in one or two lines if the diff doesn't show it, and nothing else; the durable detail belongs in `CLAUDE.md` and the README, not in the history. A subject line alone is fine for a mechanical change. On Windows, write the message to a file and use `git commit -F <file>`; PowerShell here-strings are unreliable through the tool layer.
- Do **not** add `Co-Authored-By: Claude` or similar trailers unless the user explicitly asks — the existing history doesn't use them.
- Prefer one commit per cohesive feature/decision. Split only when the parts are genuinely independent; don't split a single feature just because it touches many files.
- **Stage by explicit path.** Never `git add -A` or `git add src` — the user frequently has unrelated work in progress, and a broad add has already swept their files into a commit once.
- Line-ending noise: `.gitattributes` normalizes to LF, so `git status` should stay clean on Windows. If it doesn't, run `git add --renormalize .` once — don't stage random `M` lines as part of feature commits.

## Commands

Package manager is **bun** (`bun.lock` present) — use `bun install` / `bun add`, not npm/yarn/pnpm.

- `bun run dev` — start Vite dev server
- `bun run build` — typecheck (`tsc -b`) then production build via Vite
- `bun run lint` — Biome check (linting + format check)
- `bun run lint:fix` — Biome check with auto-fix
- `bun run format` — Biome format, write mode
- `bun run preview` — preview production build

There is no test runner configured yet. **Biome is the enforced linter/formatter** (2-space indent, double quotes, semicolons, 100-char line width, auto-organizes imports on check) — `eslint.config.js` exists but is not wired into an npm script, so prefer Biome conventions when in doubt. `bun run build` occasionally exceeds a 2-minute tool timeout on this machine; that is a harness kill (exit 143), not a build failure — re-run with a longer timeout before reporting a problem.

## Architecture

The app is a visual, drag-and-drop **step-by-step form builder** ("Form Orchestrator") that compiles its entire configuration down to a single structured JSON document.

### File layout conventions

Components follow **atomic design**: `src/components/atoms|molecules|organisms/`, plus `src/components/layout/`. Panels live under `organisms/panels/`. Each component and hook gets its **own folder** with co-located files — `X/X.tsx`, `X/X.types.ts`, `X/X.constants.ts`, `X/X.utils.ts` (only the ones it needs). Hooks follow the same pattern in `src/hooks/useX/useX.ts`, libs in `src/lib/<name>/<name>.ts` with the same suffixes.

`X.ts` should read as the module's public API — helpers, constants and types belong in the co-located files, not inline.

**A co-located `X.types.ts` / `X.constants.ts` is private to its folder.** The moment anything outside that folder imports from it, the declaration becomes global and moves to `src/types/` or `src/constants/`. Both directions were audited to zero; keep it that way when adding code. Two corollaries learned while applying it:

- When the leaking declaration drags its neighbours (a type that references sibling types, a constant that needs a private helper), **move the whole file** rather than splitting it — a partial move leaves `src/types` or `src/constants` importing from `src/lib`, which is worse than the original problem. That is why `types/formula.ts`, `types/exportForm.ts` and `types/payloadMapping.ts` are whole-file moves, and why `roundTo` lives unexported inside `constants/formula.ts`.
- Whatever stays genuinely private stays put: `FieldSpec` in `baseTemplate`, `TopologicalResult` in `fieldGraph`, `SALDO_NETO`, `CONDITION_COPY`, the tokenizer regexes.

The rule is **not enforced by tooling** — it was verified with throwaway audit scripts. A Biome `noRestrictedImports` pattern over `*.types` / `*.constants` would make it permanent; offered, not yet built.

Known wart: `store/formStore.utils.ts` imports `findFieldById` back from `store/formStore.ts`, which imports the utils — a cycle that only works because function declarations are hoisted. Moving `findFieldById` down into the utils would fix it but ripples into the components that import it from the store.

### Pieces

- **Setup wizard** (`src/components/organisms/SetupWizardModal/`, logic in `src/hooks/useSetupWizard/`): 2-step modal shown when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads `getIndustriaComercioFormTemplate()` and `getIndustriaComercioIntroTemplate()` (`src/lib/baseTemplate/`); the other two types start from a single blank row. Step 2 asks whether an intro modal is needed and, if so, how many steps — this seeds `introModal.steps`. `DraftRecoveryModal` (`src/components/organisms/DraftRecoveryModal/`) runs before the wizard on mount if `loadDraft()` finds a saved draft.
- **ICA template** (`src/lib/baseTemplate/`): the eight steps of the autoliquidable, built from `FieldSpec` rows — Datos/Contribuyente, Base gravable (renglones 8–16), Actividades gravadas (the repeatable group), Impuesto a cargo (17–25), Deducciones/sanciones/anticipos (26–34), Totales (35, 36, 38), Pago voluntario (39, 40), Firmas/Contador-Revisor. Computed renglones carry `formula` + `alwaysDisabled`; `SALDO_NETO` is the shared subexpression behind the 33/34 a-cargo / a-favor pair, expressed as `max(neto, 0)` and `max(-(neto), 0)`.
- **State** — single Zustand store, `src/store/formStore.ts` (`useFormStore`), typed by `src/types/formStoreTypes.ts` plus the domain type files: `field.ts`, `formStructure.ts`, `setup.ts`, `placement.ts`, `ui.ts`, `store.ts`. Constructors, canvas-wide walkers and template bootstrapping live in `formStore.utils.ts`; `formStore.constants.ts` holds `THEME_STORAGE_KEY` and the `NO_ROWS` / `NO_GROUPS` sentinels. Holds:
  - `formSteps[]` — the main form is **multi-step**; each `FormStep` has `stepId`, `title`, optional `subtitle`, its own `rows`, and optional `groups`.
  - `introModal.steps[]` — same shape minus `groups`.
  - `activeCanvas`: `{type: "formStep" | "introStep", stepId}` — which canvas is being edited.
  - UI state: `selectedFieldId`, `isSidebarOpen`, `sidebarTab`, `dragPlacement`, `isDarkMode` (persisted to `localStorage` under `form-orchestrator-theme`), `lastSavedAt`.
  - `savedComponents` ("Almacén de Partes") and `setupConfig`.
  - Selector helpers exported alongside: `getActiveRows`, `getActiveGroups`, `findFieldById`, `getAllFields`, `findRowContainingField`, `findRowById`.
  - Row/field mutations apply uniformly to whichever canvas holds the target id via `mapRowEverywhere`/`mapFieldEverywhere`. Notable actions: `addFieldToRow`, `moveField`, `removeField` (also clears any `enableWhen`/`visibleWhen` pointing at it), `updateField`, `setFieldName`, `updateFieldValidations/Styles/Logic/FileConfig`, `updateFieldApiBinding`, `setFieldFormula`, `setFieldLabelFor`, `setFieldContent`, `addFieldRule`/`updateFieldRule`/`removeFieldRule`/`reorderFieldRule`, `addFieldOption`/`removeFieldOption`/`updateFieldOptionLabel`, `setFieldEnableWhen`/`setFieldVisibleWhen`, `toggleFieldDependency`, `addRowToActiveCanvas`/`updateRowColumns`/`removeRow`, `addGroupToActiveStep`/`addRowToGroup`/`updateGroup`/`removeGroup`, the step actions for both canvases, `saveFieldAsComponent`/`addSavedComponentToRow`/`removeSavedComponent`, `restoreDraft`.
  - **Selectors must return stable references.** Zustand reads them through `useSyncExternalStore`, which compares by identity, so a selector returning a fresh `[]` on every call causes "Maximum update depth exceeded". That is what the `NO_ROWS` / `NO_GROUPS` module-level constants are for — never inline an empty-array literal in a selector.
- **Field model** (`CanvasField` in `src/types/field.ts`): `name` (unique technical slug, `src/lib/fieldName/`), `type`, `label`, `colStart`, `colSpan`, `validations`, `styles`, `logic`, plus optional `title`, `options[]`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `enableWhen` and `visibleWhen` — the last two a `FieldCondition` `{fieldId, operator, value}`. Operators: `equals | notEquals | greaterThan | lessThan | startsWith | endsWith | contains | matches | in | isEmpty | isNotEmpty | isTruthy | isFalsy`. `logic` is `{dependencies, typeScript, formula?, rules?}`. Field types come from `FIELD_TYPES` in `src/constants/fieldTypes.ts`, grouped by `FieldTypeCategory` — **básicos** (text, number, select, textarea, checkbox, calculated, file), **complejos** (search_select, toggle_group, radio_group, checkbox_group) and **contenido** (label, rich_text; see "Presentational fields"). `FieldPalette` renders one section per category from `PALETTE_SECTIONS`, skipping empty ones, so adding a type is only a `FIELD_TYPES` entry.
- **Grid**: `src/constants/grid.ts` — `GRID_BASE_COLUMNS = 16` is the default per-row column count; rows carry their own `columns` (clamped to `MIN_ROW_COLUMNS`…`MAX_ROW_COLUMNS`, 1–24) and shrinking a row clamps each field's `colSpan` to fit.
- **Two-column layout** (`src/components/layout/AppLayout.tsx`):
  - Left sidebar (`organisms/Sidebar/`): an icon rail (`SidebarTabRail`, includes the dark-mode toggle; clicking the active tab collapses the panel) over a tabbed panel — `SidebarTab` is `fields | attributes | validations | styles | logic | apiMapping | library | catalogs`, rendering `FieldPalette` + `panels/AttributesPanel|ValidationsPanel|StylesPanel|LogicPanel|ApiMappingPanel|LibraryPanel|CatalogsPanel`. `fields`, `library` and `catalogs` are the three that work with no field selected. `LogicPanel` hosts `FormulaInput`, `FieldRulesEditor` and `ConditionEditor` — the last one twice, told apart by its `kind` prop. `FileOptionsEditor` and `FieldOptionsEditor` handle type-specific config.
  - Right canvas (`organisms/Canvas/Canvas.tsx`): grid drop targets (`@dnd-kit` `useDroppable` per row, one row = one grid), laid out by `CanvasRowsGrid` which blocks consecutive rows of the same group into a `RepeatableGroupBand`. `CanvasTabs` switches `activeCanvas`; `StepTitleEditor` edits title/subtitle; `RowColumnsMenu` changes a row's column count and `FieldResizeHandle` + `src/hooks/useFieldResize/` drag-resizes `colSpan`; `FieldContextMenu` (right-click, via `src/hooks/useFieldContextMenu/`) offers per-field actions. The header carries `SaveButton`, a "Ver JSON" toggle rendering `JsonPreviewCanvas`, a payload-coverage view in `PayloadPreviewCanvas`, and "Exportar JSON". The intro-modal canvas renders inside a decorative fake-modal frame.
  - Drag-and-drop wiring (palette → row, library component → row, canvas field → row) lives in `src/hooks/useDragAndDrop/`; `App.tsx` only wires `DndContext`/`DragOverlay`. Every palette drop creates the field directly — options are configured later, see "Options and `apiBinding`".
- **Payload mapping** (`src/lib/payloadSchema/`, `src/lib/payloadMapping/`): `PAYLOAD_SCHEMA` is the hardcoded `DeclaracionIcaE` contract. `buildMappingTree` pairs every leaf with the field bound to it and flags type mismatches, orphan bindings and host-provided leaves; `PayloadPreviewCanvas` renders it.
- **Persistence** (`src/hooks/useAutosave/`, `src/lib/persistence/persistence.ts`): autosaves to `localStorage` on an interval once setup is complete; `src/hooks/useKeyboardShortcuts/` binds Ctrl/Cmd+S to the same save. `loadDraft`/`clearDraft` back the recovery modal.
- **Output** (`src/lib/exportForm/`): `downloadFormExport`/`buildFormExport` serialize `projectMeta`, `setupConfig.introModal`, and `formSchema.steps[]` — each step with its `rows[].fields[]` (`colStart`, `colSpan`, `styles`, `validations.zodSchema` from `src/lib/zodSchema/`, `logic` including `formula` and `rules`, `options`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `enableWhen`, `visibleWhen`) plus `groups[]` (with `min`/`max`/`arrayPath` and a `buildGroupZodSchema` array schema) and `rows[].groupId` — plus `formSchema.gridBaseColumns`, into one downloadable JSON file. Field ids in conditions, rules, dependencies **and `labelFor`** are **resolved to names** on the way out. `validations.zodSchema` is **optional**: presentational fields omit it, and its absence is how the consumer knows there is nothing to validate.

### Prescribed stack (from spec, already in package.json)

- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` for building/validating generated form fields (Zod schemas are authored dynamically per-field and stored as part of the field config, e.g. `"z.number().min(0)"`)
- `zustand` for the canvas/builder state tree
- Tailwind v4 (via `@tailwindcss/vite`) for all styling — no CSS-in-JS; dark mode is class-based (`document.documentElement.classList.toggle("dark", …)` in `App.tsx`), so every new surface needs its `dark:` variants
- `uuid` for generating field/row/step ids
- `reicon-react` for icons (not lucide/heroicons)

### Code style

- **Comments are in Spanish, `//` only — never JSDoc `/** */`.** In TypeScript a JSDoc block restates the types already in the signature: pure noise, and the first thing to rot. Written without accents, matching what is already there.
- **`src/lib/`, `src/store/` and `src/hooks/` carry a header comment per file** stating the file's *role* and its boundary, plus targeted comments where there is a trap, an invariant the code cannot express, or a decision with a discarded alternative. The bar is deliberately high: **if the comment can be deduced from the line below it, it does not get written** — that is the only thing keeping these from aging into lies. `.types.ts` files of a handful of obvious fields get nothing.
- `src/components/` is **not** commented as a matter of course. JSX is mostly self-describing, and the density there would cost more than it returns. Add one only when a component hides a real decision.
- **Explicit type annotations** on local declarations (`const isIntro: boolean = …`), matching the existing files.
- Biome conventions win over `eslint.config.js` (which isn't wired into a script).
