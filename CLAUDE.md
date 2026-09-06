# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder is implemented: the eight-step Industria y Comercio template, repeatable groups, the script/rules engine, presentational field types and the **simulator** (a working prototype of the consuming app that runs the exported JSON). `docs/Project.md` (Spanish) is the original spec — still the reference for the target JSON schema; check it before adding features.

Known gaps:
- No test runner, none planned (project too volatile per the user). Verification uses throwaway `pnpm exec tsx` scripts in the scratchpad.
- `logic.script` exports **compiled JS**, run by the consumer with `new Function` — this is the file's trust boundary (anyone handing the consumer a JSON gets code execution there). Coordinated decision since the user builds both ends.
- `persistence.ts` versions and migrates drafts (`DRAFT_SCHEMA_VERSION`) before validating. Zod validates *shape*, not coherence (`colSpan: -999`, a `dataSource` on a `text` field, a dangling `labelFor` all pass).
- `validations.pattern` isn't validated at authoring time — an invalid regex throws in the consumer. A `try { new RegExp(value) }` guard in `ValidationsPanel` was offered, not yet built.
- **Renglón 31 hardcodes two catalog ids**: `TIPO_SANCION_OTRA = "4"` and `TIPO_SANCION_EXTEMPORANEIDAD = "1"` in `baseTemplate.constants.ts`. Reordering `tipos_sancion` breaks both in silence. Fix (read the catalog bank, not `lib/mockCatalog`) is scoped and deferred.
- **Two catalog-fed selects still use path-inference instead of `dataSource`**: `periodo_anio`, `clasificacion_contribuyente` (+ the `tipo_representante` toggle). `CATALOGS` declares 9 names, only 8 are wired. `tipos_persona`, `tipos_sancion`, `juegos_permitidos` have no field pointing at them yet. Catalog ids are unconfirmed contract names with the consumer.
- **Renglones 31 and 37 need the intro modal** (`{periodo_anio}` lives there) but the setup wizard makes it optional even for `industria_comercio`. Without it the field stays typeable but silently uncalculated.
- Selects mapped to `number` leaves show a permanent `⚠ tipo` warning (a two-line fix in `fieldMatchesSchemaType` has been offered, not approved).

## The right panel (`RightSidebar`)

Header, `CanvasTabs`, `TransferNotice` and `StepTitleEditor` moved off the canvas into a right-hand panel (`organisms/RightSidebar/`). `AppLayout` takes three slots (`sidebar`, `canvas`, `rightSidebar`).

**It is modelled on Figma's right panel, by explicit user reference**, in three stacked rows: an **action row** (Guardar left; Simulador and Exportar right, mapping Figma's ▷ and Share), a **text tab strip** with the zoom on its right (Figma's `Design | Prototype … 7% ˅`), and a **body of flat blocks**. The two tabs are `RightSidebarTab` in `types/ui.ts` (`TABS` in `RightSidebar.constants.ts`): **Proyecto** — blocks "Vista" (`ViewModeSwitch`) and "Formulario" (`FormSummary`) — and **Steps** — "Pasos" (the chip grid) and "Paso activo" (título/subtítulo).

Settled:
- **The right panel does not collapse.** Fixed `w-80`, no `isRightSidebarOpen`, no chevron strip — the tabs switch content instead of hiding it. The left sidebar keeps its own collapse (clicking the active tab), so the two are deliberately *not* symmetric on this point.
- **The active tab is underlined, not filled.** A grey `bg-surface-raised` pill was the first version and read as a fourth button of the action row right above it — an elevated surface on an elevated surface. It is now plain text, semibold when active, with a 2 px brand rule (`after:` pseudo-element) sitting on the strip's own `border-b`: no new surface, and the only orange is a 2 px sliver that doesn't compete with Exportar. During a drag the forced Steps tab grows a small brand dot (`PANEL_TAB_DROP_DOT_CLASSES`) — the only thing that explains why the tab switched by itself.
- **Text tabs, not an icon rail.** An icon rail was built first (mirroring the left sidebar) and rejected in favour of the Figma reference. `SidebarTabRail` was made generic for that version and **reverted** once only the left sidebar used it again — an unused generic is the kind of leftover nobody later knows whether they can touch.
- **`molecules/PanelBlock/` is the flat section, and it coexists with `PanelSection` on purpose.** `PanelSection` is the rounded card with a black veil, for panels that already have margins (the left sidebar's eight). `PanelBlock` is a full-bleed block closed by a `border-b`, for a panel that runs to its own edge. Unifying them would repaint all eight left panels, which is not what was asked.
- **"Vista" is a segmented control (`molecules/ViewModeSwitch/`), not `TabButtonGroup`.** Three exclusive modes of one canvas read as a segmented control: a sunken rail, the active option a raised pill (`bg-surface`, `dark:bg-surface-inset`), one icon each (`Grid`/`Code12`/`Hierarchy22` in `VIEW_MODE_ICONS`). The old version put three loose buttons with the active one in solid orange, needed a `[&>nav]` override to strip the shared component's own border and padding, and never said the modes were exclusive. `VIEW_MODE_TABS` stays the canonical list of modes and labels; the icons are the control's business. `TabButtonGroup` itself stays — `FieldContextMenu` and `PreviewResults` still use it.
- **"Formulario" is `molecules/FormSummary/`, not four label→value rows.** Identity first (brand-tinted badge + form type + "Tipo de formulario"), then a bordered strip of big `tabular-nums` metrics (Steps / Modal / Campos), then the save state as a dot + hour. `Campos` is the one number the panel didn't read before: `formSteps.reduce(… getAllFields(step.rows).length)`, form steps only (the modal has its own cell). The dot tells saved from never-saved without spending a row saying it; the Modal cell and its grid column disappear with `hasIntroModal` off.
- **The zoom lives on the tab strip, not inside Proyecto**, because it belongs to the canvas rather than to a section: it stays visible under either tab (and only in `canvas` view mode, where it means anything).
- **`CanvasZoomControl` is a `100% ˅` dropdown, not `− 100% +`.** Menu: Acercar / Alejar with their shortcut hints, then `ZOOM_PRESETS` (50/75/100/125/150 %) with a check on the current one. Choosing closes it — it is a jump, not a control you keep manipulating; the wheel and Ctrl `+`/`-`/`0` still do the continuous work with the menu shut. Presets must stay inside `[ZOOM_MIN, ZOOM_MAX]` or `clampZoom` silently returns something other than the label.
- **The panel never scrolls.** `min-h-0` on the body wrapper (without it a flex item can't shrink below its content and the overflow escapes the panel) plus a `max-h-56 overflow-y-auto` scoped to just the step-chip grid inside `CanvasTabs` — the one deliberate exception, and the only place in the panel that can scroll.
- **Every step tab is a bare number, the active one included.** The active chip used to expand with its title; that made the whole grid reflow on every step change — exactly what must not happen while you point at one of these chips with a row hanging off the cursor. The active chip is now the same 28 px square, told apart by a brand fill plus a `ring-[3px] ring-brand/20` halo, and the delete ✕ still hangs only off it. Uniform width packs 8/row (~40 steps before the grid's own scrollbar). The name lives in the "Paso activo" block, whose header now reads `Paso N · Formulario` to tie the chip's number to the title being edited, and in each chip's native `title`.
- **The two chip groups are captioned only when both exist** (`GROUP_CAPTION_CLASSES`) — with the intro modal off, a "Formulario" caption would just repeat the block title above it.
- `StepTabChip`'s droppable id/data is unchanged — only the visual content collapses.
- **During a drag the Steps tab wins, derived and not written** (`visibleTab = isTransferring ? "steps" : activeTab`, off `rowDrag`/`draggingFieldId`). The step tabs are the drop targets for moving a field or a row to another step; from Proyecto that gesture would have nowhere to land. It snaps back to the chosen tab on drop with no store write. What made this impossible before — opening the panel reflowed the canvas under a moving pointer, mid-gesture — no longer applies now that the panel's width is fixed.
- `canvasViewMode` moved to the store (`types/ui.ts` / `constants/canvasView.ts`) since the tabs and canvas are now different subtrees.
- Neither `rightSidebarTab` nor `canvasViewMode` is persisted, matching `isSidebarOpen` and `canvasZoom`.
- `FORM_TYPES`/`FormTypeOption` moved to `constants/formType.ts`/`types/setup.ts` (co-location rule: used from outside `SetupWizardModal/`).
- **`SaveButton` is compact and its timestamp is its `title`.** It first sat above a second line with the hour; in a three-button action row there is no second line, and text that comes and goes would shift the buttons beside it. The hour is still readable as a row of the "Formulario" block.
- **`TransferNotice` carries its own `m-3`.** The body has no padding of its own — each block brings it — and a padded wrapper would leave dead space at the top whenever there is no notice, which is nearly always.

## Zone placement (Shift / Shift+Ctrl while dragging)

**Shift** highlights every column of the target row so you pick the exact start column (width unchanged). **Shift+Ctrl** anchors the start where Ctrl was pressed and lets the pointer set the end (width follows selection). Modifiers are read live and apply to palette drops too.

`CanvasField.colStart` (1-based, CSS grid line numbers) **ships in the export**. Rules live in `src/lib/rowLayout/` (`getFreeRuns`, `findNearestFit`, `resolvePlacement`, `getMaxSpanAt`, `repackRow`, `migrateRows`) — pure, no React/store imports. `loadDraft` migrates pre-`colStart` drafts by turning overflowing visual lines into real rows.

Settled — do not re-litigate without asking:
- **`dragPlacement` is written only when it changes** (`samePlacement` value-compare) — cuts ~100 writes/drag down to the handful that matter.
- **Collision resolves by magnetic snap, never by pushing.** No fit → red, drop rejected.
- **Holes are preserved** everywhere except `updateRowColumns`, which re-packs deliberately.
- **One row is one visual line — rows never overflow to a second line.** A full row rejects the drop; the user must add another `CanvasRow`. Deliberate guardrail, tested and kept. Only revisit if the user explicitly asks.

## Canvas zoom (`canvasZoom`)

Canvas body scales via `transform: scale()`, 50–150%, from a header control, Ctrl/Cmd+wheel, and Ctrl/Cmd `+`/`-`/`0`. `src/lib/canvasZoom/` (arithmetic) + `src/hooks/useCanvasZoom/` (DOM).

**Only the canvas body scales** — header/tabs/notices live in `RightSidebar` now, at 1×. `FieldContextMenu` also stays outside the scale so `clientX/clientY` positioning stays correct.

Settled:
- dnd-kit applies no `transform` inside the scaled container — dragged elements go `opacity-0`, the `DragOverlay` is a sibling of `<AppLayout>` outside the scale. Moving either breaks the classic "travels k× too far" bug.
- Collision detection needs no changes — `pointerWithin`/`rectIntersection` compare visual-space rects, so the ratio is scale-invariant.
- **Scale is read from the DOM**: `getCanvasScale(el) = rect.width / el.offsetWidth`, not from the store — returns exactly 1 with no zoom and can't go stale like a threaded store value. ~0.05% error from `offsetWidth` rounding; breaks under a rotated ancestor (none exist here).
- The bug this fixed was mixing visual and layout pixels in exactly three places (`getColumnAtPointer`, `useFieldResize`) — fixed with five divisions back to layout space.
- `measureRow` returns layout pixels; `RowDragPreview` scales itself. `transformOrigin: top left` lands the ghost on the replaced row.
- The overlay's label chip stays at 1× (floating caption, not a replica).
- **`marginBottom: contentHeight * (zoom - 1)` compensates for the transform not affecting layout** — without it, zooming out leaves dead scroll and zooming in pushes content out of reach. Measured via `ResizeObserver` on `offsetHeight` (no feedback loop).
- At `zoom === 1` neither the transform nor the margin is emitted — identical DOM to before this feature.
- Wheel zoom is continuous; buttons/shortcuts step 10% (Figma-like).
- **Not persisted** — view state only, resets to 100% on reload.
- One zoom for both canvases (form steps + intro modal).
- **Anchors on viewport middle, not the cursor** — deliberate given the centered, non-horizontally-scrolling document. Computed in the hook body, not an effect (rects would already have changed).
- Known cosmetic limit: `min-h-[60vh]`/`70vh` resolve against the real viewport regardless of scale, so at 50% the empty canvas reads shorter than intended. Left as is.

## Reordering rows (drag the row itself)

A whole `CanvasRow` can be dragged to a new position. Row order **is** `step.rows[]` order — no separate index — so `persistence`/`exportForm`/simulator needed zero changes.

Rules in `src/lib/rowOrder/rowOrder.ts` (`resolveRowDrop`, `resolveBandDrop`, `reorderRows`), pure, mirrors `rowLayout`. Store action `moveRow(rowId, target: RowDropTarget)`.

Settled:
- **A row drag never crosses into/out of a repeatable group** (would silently clear `apiBinding` on every field in it). Joining/leaving stays a separate explicit action; reordering within a group works normally.
- A loose row over a band snaps to the band's nearest edge; a row inside a group pointing outside it goes red and is rejected.
- `rowDropTarget` written only on change; `recompute` skips column placement entirely during a row drag.
- The group band gets its own droppable, `disabled` unless a row drag is active — keeps it from competing with inner rows for field drops.
- The drag handle is a hover affordance on the row's left edge only (`RowDragHandle`), using `group/row` (not a bare `group`, which would leak into every chip's own hover state).

### The gesture: you carry the section, the rest step aside

Rejected an earlier "drag a small chip, draw a line" version — had to feel like moving the whole section with others opening a gap.

- Overlay is a full-width replica (`RowDragPreview`), measured once at drag start; simplified (no handle/menu/resize grip).
- **Dragged row goes `opacity-0`**, not dimmed — neighbours shift onto its exact spot; dimming would show overlap with the ghost.
- `buildRowDisplacement` mirrors `rowOrder`'s two cases (loose row displaces blocks; in-group reorder displaces individual rows).
- Transition class is bound to the same state as the transform (`rowDrag !== null`) so drop and reset commit together — no FLIP jump-back.
- `dropAnimation={null}` for row drags (dnd-kit's default flies to the wrong rect).
- Only the red rejection indicator survives; the valid one was removed as noise once the gap already shows it.
- Bounce curve: `ease-[cubic-bezier(0.34,1.6,0.5,1)]` (in a source file so Tailwind v4 scans it).

## Row styles (`row.styles`)

`RowStyles`: `customCss`, `marginTop`, `marginBottom` — **narrower than `FieldStyles`** (no `backgroundColor`/`textColor`, on purpose: a row is layout, not something read like a field). Authored via `RowStylesMenu` (popover at the row's right edge). Store action `updateRowStyles`.

Settled:
- **Optional, absent by default** (same as `groupId`) — purely additive, no `DRAFT_SCHEMA_VERSION` bump, just a `persistence.schema.ts` line (`rowStylesSchema`).
- Export carries it resolved: `styles: resolveRowStyles(row.styles)`, optional key, omitted when empty.
- Reaches the simulator too (`PreviewRowsGrid` spreads it, structural props last).
- `RowDragPreview` deliberately ignores `row.styles` (generic ghost, not a faithful preview).

## Styles are plain CSS, not Tailwind classes

`FieldStyles.customCss`, `RowStyles.customCss`, `FieldTooltip.customCss` hold **raw CSS text**, not Tailwind classes. Replaced `customClasses` because Tailwind v4 scans source files at build time — a class typed into the builder never appeared in source, so it was emitted only by coincidence. Measured: `font-bold`/`text-right`/`uppercase` worked, `bg-purple-700`/`tracking-widest`/`text-2xl` silently didn't — the worst kind of bug (partially working).

`src/lib/cssStyles/` (no React/store imports): `parseCssText` → `CssStyleMap` (camelCase, ready for React `style`); `resolveFieldStyles`/`resolveRowStyles`/`resolveTooltipStyles` merge named properties with parsed `customCss` on top; `unsupportedDeclarations` runs `CSS.supports()` for a non-blocking warning (guarded for `typeof CSS === "undefined"` in tsx scripts).

Settled:
- **Export carries one flat `CssStyleMap`** per field/row/tooltip, not named properties + a class string. `textColor` → `color` only on export; internal name stays `textColor`.
- **The free text wins** (`{...namedProperties, ...parseCssText(customCss)}`, ordinary cascade) — canvas paints what the consumer will paint.
- **No sanitizer** — CSS via React `style` executes nothing; `unsupportedDeclarations` is informational, not blocking, same treatment as an unrecognized `{campo}`.
- **Structural placement always wins**, enforced by DOM node separation (field's `gridColumn` lives on a different node than `customCss`) or spread order (row's structural props spread after resolved styles).
- Canvas splits `marginTop`/`marginBottom` onto the spacing wrapper and the rest onto the `<button>` that paints (applying custom CSS to the wrapper would be invisible under the button's opaque background). `CanvasRow`/`TooltipBubble` have one node each, apply the map directly.
- Simulator doesn't re-resolve anything — consumes `ExportedField/Row/Tooltip.styles` as already-resolved objects.
- **Migration (`DRAFT_SCHEMA_VERSION` 6) never discards what it can't translate** — `TAILWIND_TO_CSS` covers the common classes; anything else survives as a CSS comment listing the original class names (same treatment as `preservedFormula`). Applies to `field.styles`, `field.tooltip`, `row.styles` (the last needed its own draft walker, `mapDraftRows`/`mapStepRows`).

## Moving things between steps (drop on a step tab)

Drag a field or row onto another step's tab to move it — same id, same name, references intact. Shared core in `src/lib/fieldTransfer/fieldTransfer.ts` (`canTransfer`, `transferGroup`, `planLanding`, `collectCrossingRefs`), used by both `moveFieldToStep` and `moveRowToStep`.

### The Almacén de Partes is gone — do not rebuild it

It "moved" a field by copying it (new id/name) into a `SavedComponent`, then required manual cleanup. Dragging onto a step tab does the real move properly, so the Almacén (store, panel, tab, draft key, all four `library`-typed call sites) was deleted. `DRAFT_SCHEMA_VERSION` went to **5** with a migration step that *deletes* `savedComponents` from `localStorage` (dropping it from the schema alone would have left it there invisibly). If genuine reuse is needed later, that's a different feature (a template library), not this one.

Settled:
- A linked `label` travels with its field in both directions (label ordered first, so it lands to the left).
- A row belonging to a repeatable group cannot change step (same rule as reordering) — tabs render rejected/red for it.
- **`planLanding` deliberately skips `resolvePlacement`** (which truncates `colSpan` as a last resort) — a field lands whole, in a new row if needed, never narrowed where you can't see it.
- A row lands appended at the end of the target step; reposition afterward by dragging.
- Target step is stripped of any pre-existing linked label before planting, to avoid duplicating it.
- `activeCanvas` follows the move and the field stays selected.
- **Crossing references are reported, never pruned** (`TransferNotice`) — they still evaluate at runtime by name, but `LogicPanel`'s candidate list is `formSteps`-only so they stop being editable there. Script refs are excluded (travel by name, which moves with the field).
- Tab droppable is `disabled` unless a transfer is in flight (same structural guard as the group band).
- **Collision detection is `pointerWithin` first, `rectIntersection` fallback** (`pointerFirstCollision`) — dnd-kit's default compared the row-wide overlay against each tab, so the widest covered tab always won regardless of pointer position. Rect fallback still forgives gaps between rows.
- Over a tab the row preview collapses to a compact chip (`hoveredTransferTarget`) so the tab strip stays visible, and switches to `centerOverlayOnCursor`.

## Repeatable groups (`actividades[]`)

A repeatable group is a **marker on the row**, not a nested container: `CanvasRow.groupId` points at a `RepeatableGroup` in `FormStep.groups[]`. Chosen because `useDragAndDrop` resolves everything by `rowId` and never inspects contents, so drag & drop, `rowLayout`, resize and placement all work inside a group unchanged, and fields stay freely movable/reorderable. Cost: contiguity isn't structural — `normalizeGroupRows` re-pulls a group's rows together after any mutation that could scatter them.

Helpers in `src/lib/repeatableGroup/repeatableGroup.ts`. Bounds default `DEFAULT_GROUP_MIN = 1` / `MAX = 15` (ICA rule), clamped to `MIN_GROUP_ITEMS = 0`…`MAX_GROUP_ITEMS = 99`.

Settled:
- **`arrayPath` is absolute** (`actividades[].idActividad`), not group-relative — one namespace, no special cases in `resolveLeaf`/mapping.
- Moving a field out of a group clears its `apiBinding` (path is meaningless outside the array item). Changing a group's `arrayPath` clears all members' bindings for the same reason.
- Deleting a group's last row deletes the group (`pruneEmptyGroups`); `removeGroup` instead keeps the rows and strips `groupId`.

UI: `RepeatableGroupBand` (title, min/max, `arrayPath` select, +Fila, dissolve, collapsed `GroupChecksEditor`), `CanvasRowsGrid.utils.ts` (`toCanvasBlocks`), `CanvasAddGroupButton`.

### `group.checks` — validation that spans the whole group

`GroupCheck` = `{id, label, enabled, script, message}` on `RepeatableGroup.checks[]`, exported compiled like `logic.script`. Evaluated **once per group in root scope** (not per repetition) — **truthy passes, falsy shows message**. Motivating rule (ICA template): sum of `ingresos_gravados` across activities must equal renglón 16.

**First non-per-field validation in the project** — Zod's `safeParse` works on one scalar at a time and can't see the root.

Settled:
- Owner is the group, not the field it compares against — the activities step has no root field to hang an error on, and hanging it on renglón 16 (one step earlier) would block navigation before any activity exists.
- A script, not a typed rule — reuses `compileScript`, the scanner, the prelude, `reads`, the compile cache, and the consumer already runs compiled scripts with `new Function`. A typed rule would need an interpreter.
- **A broken check never blocks** — throw or `undefined` both report a `RuntimeIssue` and pass (author's bug, not the taxpayer's).
- **`enabled: false` isn't exported at all** — no third state for the consumer to interpret.
- Scope built from `snapshot.groups` (third-pass, definitive), never the root's first-pass array copy.
- Not an edge in `fieldGraph` — a check observes but produces no value.
- Error key `check:${groupId}:${checkId}` (`checkKey`), shares the map with field errors (a field literally named `check` can't collide).
- `stepErrorKeys` adds group check keys so "Siguiente" actually gates on them.
- `lib/groupCheck/` stays declarative-only — evaluation (`buildCheckScope`, `runGroupCheck`) lives in `runtimeValidation.ts`, past the lazy boundary, to keep the exporter from dragging `formRuntime`/`scriptRuntime` into the initial chunk (measured: +12.5 kB initial otherwise).
- Compares with `abs(a - b) < 1`, not `===` (both round to the thousand today, but shouldn't have to).
- **Ships enabled** — balancing is the rule; forgetting to turn it on would let evasion through silently.

## The field script (`logic.script`, `formScript`, `logic.rules`)

**A field's value is computed in exactly one place: `logic.script`**, JS with `{campo}` to read other fields. Replaced a self-contained formula language + rules editor + an unexecuted `logic.typeScript` textarea — three mechanisms for one question.

`src/lib/fieldScript/fieldScript.ts`: `compileScript`, `validateFieldScript`, `validatePrelude`, `buildScriptFunction`, `composeScriptBody`, `preludeLineOffset`, `normalizeScriptResult`. **No function throws** — errors travel in the result since the editor calls them on every keystroke.

Contract (identical for a script and a rule effect):
- `return` gives the value; **`return undefined` means "leave what the user typed"** (not `computed`, stays editable).
- Scope: `value`, `index` (repetition inside a group), and helpers from `src/constants/fieldScript.ts` — `num`, `sum`, `count`, `abs`, `min`, `max`, `round`, `floor`, `ceil`, `dvNit` — passed as **named parameters**, not a container object.
- Inside a group `{sibling}` is that row's scalar; from root `{column}` is the whole array (`sum` flattens it).
- Non-finite result → `null` (`normalizeScriptResult`).

**Only `{x}` where `x` is an actual field name is substituted** — lets the syntax coexist with JS destructuring (`const {a} = obj` untouched). Unknown `{x}` is a **warning, not an error** (no way to tell typo from destructuring).

**`scanScript` is a scanner, not a regex** — blind substitution broke on `{campo}` inside strings/comments. Skips strings/comments/template text, **substitutes inside `${...}`**. Known limit: regex literals aren't detected.

`formScript` (the prelude) is form-wide, **cannot read fields** (`{campo}` invalid there — no single answer inside a repeatable group). Concatenated ahead of the body, so the compile cache absorbs the repetition; `validateFieldScript` checks the body alone first so a broken prelude reports as the form's problem, not every field's.

`FieldRule` = `{id, label?, matchAll, when: RuleCondition[], effects: RuleEffect[]}`, effect is `{kind:"script", source}` or `{kind:"constant", value}` — **survived on purpose** (declarative condition+effect, not a second language). Run **after** the script, overwrite in list order. `src/lib/fieldRule/fieldRule.ts`, UI in `FieldRulesEditor`/`useFieldRules`.

`src/lib/fieldGraph/fieldGraph.ts` unifies **four** edge sources (`visibleWhen`, `enableWhen`, `rules[].when[]`, `{campo}` refs) into one dependency graph — `buildNameToIdIndex` normalizes refs to ids, `topologicalOrder` returns `{order, unresolved, cycle}`, never throws.

Settled:
- **A script cycle is warned about, never blocked** (free text, refusing input mid-word fights the person typing); condition editors *do* block with an `alert` since those are picked from a list.
- **Script sees values coerced by field type** (`coerceForScript`) — otherwise `"5"+"3"` = `"53"`. **Whole model is coerced**, not just touched keys — an untouched field's `undefined` becoming `NaN` in a subtraction was killing entire chains of renglones.
- **Compile cache is module-level**, keyed by composed body (prelude included) — without it, ~31 `new Function` calls per keystroke with 15 activities. Compile errors cached separately.
- `evaluationOrder` is **not exported** (silently appended cycle members to the end). What's exported instead is `script.reads` per field.
- `lib/formula/` is gone except its parser, which survives in `lib/scriptMigration/` purely to open pre-migration drafts. Delete once no old drafts remain.
- **An unparseable formula is preserved as a comment inside the script**, field falls back to `return undefined` — neither dropped nor crashes the draft (old formula editor stored invalid text too).

## Presentational fields (`label`, `rich_text`)

**Input fields** collect a value; **presentational fields** only show content. Predicate: `isPresentationalField` (`src/lib/fieldKind/fieldKind.ts`), backed by `PRESENTATIONAL_FIELD_TYPES`.

A presentational field keeps `colStart`/`colSpan`/`styles`/`visibleWhen`, loses validations/payload mapping/`enableWhen`/script/rules, never appears as a condition/script candidate. `LogicPanel` short-circuits to just visibility for them.

### `label` — an external label bound to a field

Link lives **on the label**: `CanvasField.labelFor` points at the input. "A field with a linked label has no label of its own" is **derived, never stored** (`hasLinkedLabel`). `CanvasRowsGrid` builds a `linkedLabels` index once and drills it down (was O(n) per chip — measured 16.9× necessary work on a 15-field step).

Invariants: **1:1** (`setFieldLabelFor` unlinks any prior label on that target); **no dangling refs** (`removeField` clears `labelFor` too, but deleting the target just leaves the label unlinked, matching "holes are preserved"); `labelTargetCandidates` offers free input fields + the current target.

The linked field **keeps `field.label` in the model** (drives `name` and every panel that names the field) even though nothing renders it. Canvas shows the label's own text in muted italics.

**A linked label inherits its field's visibility** via a second pass in `buildScope` (target may come later in the list) — derived, never copied onto the label (which would orphan on edit). `=== false` guard: a target outside scope leaves the label alone.

### `rich_text` — a formatted content block

Standalone, never bound to input. Bold/italic/underline/links only — no lists, no headings.

**Content is stored structured, never as HTML** (`RichTextContent`, `src/types/richText.ts`) — an HTML blob would be executable markup, same class of risk as the `validations.pattern` injection. Do not "simplify" to HTML.

**The serializer is the sanitizer** (`serializeRichText`, DOM walk with a whitelist: `b/strong/i/em/u/ins/a/br`, drops `script`/`style`/`iframe` subtrees, flattens everything else to text, reads inline `font-weight`/`style`/`text-decoration` for paste-from-Word).

**`safeHref`** allows only `http:`/`https:`/`mailto:` (prefixes `https://` if no scheme) — runs at insert, serialize, **and again on draft load** (localStorage is devtools-editable). Keep all three.

Editor is `contentEditable`, repaints **only on mount** (`key={field.id}` remounts on field change — repainting on every keystroke would jump the caret to the end).

## Simulador (`FormSimulator`) — el consumidor de mentira

A working prototype of the consuming app, not a mock. **Full-screen mode** — `isSimulatorOpen` in the store, `FormBuilder` returns `<FormSimulator />` early (sidebar/canvas/`DndContext` unmount). Entry point is a button beside "Exportar JSON", deliberately not a `VIEW_MODE_TABS` member. `useAutosave`/shortcuts stay running (they live in `App`, above `FormBuilder`).

**The single rule that makes it worth anything: it consumes `buildFormExport(...)` and never touches `useFormStore`.** `useFormPreview` is the only store read, solely to feed `buildFormExport`. If the simulator can't do something, neither can the real consumer. Everything keyed by field **name** (export already resolved ids to names).

Layers (React-free, ~1ms/keystroke on the full ICA form with 15 activities):
- `lib/formRuntime/` — `buildRuntimeModel`/`resolveRuntime` → `RuntimeSnapshot` (root + per-repetition scopes + `issues`).
- `lib/runtimeCondition/` — `evaluateCondition`, the 13-operator executor (didn't exist before — builder only ever *authored* conditions).
- `lib/runtimeDerived/` — resolves `logic.script`/`logic.rules` in topological order (script → rules override → rounding).
- `lib/scriptRuntime/` — runs author code with `new Function`. A throw is that field's problem; an infinite loop freezes the tab (not worth a worker+timeout today).
- `lib/runtimePayload/` — walks `apiBinding.path` into the real `DeclaracionIcaE` object.
- `lib/zodHydrate/` — `new Function("z", ...)` over `validations.zodSchema`.
- `lib/mockCatalog/` — simulator-only option data, **never exported** (verified by grep). Three tiers: `MOCK_CATALOGS` by `dataSource.catalog` → `MOCK_BY_LEAF` by payload leaf → `placeholderOptions`. `MOCK_BY_LEAF` exists because conditions compare against **real catalog ids** (e.g. `tipo_documento === "2"` for persona jurídica) — fake ids would make persona jurídica unreachable in the simulator.
  - `mockCatalog.data.ts` is **generated, not authored** — 9 catalogs, 1601 entries transcribed verbatim from real API dumps, warts included (duplicate CUNDINAMARCA, split words, uppercase everywhere). **Do not tidy them.**
  - Departamentos/ciudades keyed by the API's own ids (1–33 / 1–1119), not DANE codes.
  - Actividades dump has a different shape (`{idDeclaracion, codigoCIIU, descripcion, tarifaXMil}`) — `idDeclaracion` used as option id, `codigoCIIU` as `code`; **unconfirmed which the payload leaf actually wants**. Dump is also a known subset (missing CIIU 210).
  - `CatalogOption` = `{id, label, code?, tarifa?}` — extra columns never reach the export (consumer's own endpoint returns them).
  - **`tarifa` column is empty** (dump lost `tarifaXMil`) — every activity reads "sin tarifa" until a fresh dump or manual paste in the Catálogos tab. Do not fabricate.
  - `dataSource.fills` projection is built and works (`codigo_actividad` fills correctly); `tarifa_x_mil` stays empty for the same data reason.
  - `periodoAnio`, `idClasificacionMunicipio`, `idTipoRepresentante` in `MOCK_BY_LEAF` are still invented (never came in a dump).
  - Adds ~93 kB raw but sits behind the lazy boundary.

Settled:
- **Three passes in `resolveRuntime`**: groups w/ raw root values → root w/ group columns exposed as arrays → groups again w/ resolved root. Collapsing this silently zeroes the ICA totals.
- A scope per repetition, not one bag.
- **`eval` is the contract, not a shortcut** — `ExportedField.validations` carries only Zod strings; the consumer has no other validation path. `hydrateZodSchema` wraps in try/catch → `RuntimeIssue`.
- `hydrateFieldSchemas` keys by schema *string* (a field can have >1 schema depending on override state; a name key can't answer).
- `required` is sniffed from the schema string (no trailing `.optional()`); `checkbox` excluded (never gets `.optional()` appended).
- Runtime issues deduplicated (`dedupeIssues`) — a broken group script would otherwise report once per repetition.
- Preview state is **local to the component tree**, never the Zustand store (answers are throwaway).
- Hidden fields are neither rendered nor validated.
- **Validation is per step and gates navigation** — no "validate everything" button. `stepErrorKeys` expands group rows to per-repetition keys; errors revealed only for reached fields (`revealed`), but the results panel shows everything live.
- `react-hook-form` still unused — the hard part is the runtime, not state; a plain value bag makes script-writeback and repeatable arrays easier.
- `number`/`calculated` render `PreviewNumberInput` (the only stateful control — owns typed draft + focus/blur, since a number input can't display `1.000`).
- **`search_select` is a modal, `select` stays native** — 425 actividades × 15 repetitions would be 6,375 `<option>` nodes mounted upfront. Modal filters code+description, accent/case-insensitive, closed = no filtering.
- **The modal cannot clear a selection** — "Quitar" was removed; changing activity means picking another, removing one means deleting the whole row (so its ingresos/impuesto go with it). First row has no delete button (`min: 1`).
- A missing tarifa shows a muted **"sin tarifa"**, gated by `fillsColumn(field, "tarifa")` so a municipios select stays silent.
- Tarifa always reads `4X1000`, never `4‰` (per-mille misread as percent otherwise).

**Behind a `React.lazy` boundary** in `FormBuilder` — measured 872 kB → 762 kB initial + 117 kB on demand. What crosses is `mockCatalog.data.ts` + `preview/` tree — **not Zod** (`persistence.schema.ts`/`catalogBank.schema.ts` import it eagerly since `loadDraft` runs at startup; getting Zod out needs an async `loadDraft`, not done). Keep the boundary honest: any new eager import of `lib/mockCatalog/`, `lib/zodHydrate/`, or `components/organisms/preview/` from the builder side pulls the chunk back in.

**Second, bigger lazy boundary**: `ScriptInput` lazy-loads `ScriptEditor` (CodeMirror, 457 kB/155 kB gzip) — only on Logic tab open. The plain-textarea fallback is the real pre-CodeMirror control, not a spinner.

## Tooltips (`field.tooltip`)

`FieldTooltip` = `{content: RichTextContent, position, customCss?}`. Only 8 types (`TOOLTIP_CAPABLE_FIELD_TYPES`): text, number, select, checkbox, calculated, file, toggle_group, radio_group. Predicates in `src/lib/fieldTooltip/`. Store action `updateFieldTooltip(fieldId, updates | null)`.

Settled:
- **Trigger is an ℹ icon, not the field** — hover-on-field is undiscoverable, doesn't exist on phones, and would cover `toggle_group` options. Icon sits next to the *visible* label (the linked label's text, if any).
- Canvas preview is looser than the contract on purpose (reveals on hovering the whole chip, to escape `overflow-x-hidden` and ease hit-testing).
- **Content is `RichTextContent`**, reusing all of `rich_text`'s machinery (editor, sanitizer, `safeHref`) — do not simplify to HTML/string.
- **Empty tooltip isn't exported.**
- **No per-option tooltips** — would only be authorable for excluded option-fields, and none exist today in the ICA template. Design stays forward-compatible.

## Rounding (`field.rounding`)

A numeric field rounds to the **nearest thousand** — the standard rule for Colombian tax renglones. `rounding?: boolean`, offered only for `number`/`calculated`. Lib: `src/lib/fieldRounding/` (`roundToMultiple`, `applyRounding`, `supportsRounding`, `exportableRounding`).

**Changes the value, not just presentation.**

Settled:
- **Boolean, not a configurable multiple** — every form built so far only ever needs the-nearest-thousand or nothing.
- **`Math.round` is a real bug here** — breaks tie symmetry with negatives (`1500→2000` but `−1500→−1000`, `−500→−0`). `roundToMultiple` rounds the magnitude and reapplies sign, `+0` kills `−0`.
- **Two application points**: on blur for what the user types (`PreviewFieldControl`); as-computed in `runtimeDerived` for a script/rule result (a `calculated` field is `alwaysDisabled`, so blur never fires there). Rounds *before* publishing to `scriptValues`, so the next field in the chain reads the rounded value.
- **Only when something produced a value** — an untouched field isn't stamped with a spurious `0`.
- Empty stays empty — `applyRounding` passes through `undefined`/`null`/blank/unparseable untouched.
- **ICA template turns it on per-step, off by exception** (`FIELDS_WITHOUT_ROUNDING`, 4 fields: `tarifa_x_mil`, `dv`, `numero_establecimientos`, `generacion_energia_kw` — the last a judgement call, kW not pesos, user was told).
- **Rounding runs before validation** — a `min:1` field typing `499` rounds to `0` and then fails, correctly, if confusingly worded.

## Number formatting (`field.formatted`)

Numeric field shown with dot-thousands/comma-decimal (`1000` → `1.000`, `1.5` → `1,5`). `formatted?: boolean`, same two types as rounding. Lib `src/lib/numberFormat/`.

**The formatted text never leaves the input** — state always holds a real `number`; `1.000` exists only on screen while unfocused. This is why payload/schemas/scripts needed zero changes; a leaked `"1.000"` string would put a wrong value in the payload and make every script read `1`.

Settled:
- **Control is `type="text"`**, not `type="number"` — the HTML spec's dot is a *decimal* separator (`"1.000"` there means one; `"1.000,5"` is invalid and blanks the field). `inputMode="decimal"` keeps the numeric keypad.
- **Stricter typing filter than native**: `sanitizeNumericInput` whitelists digits/dot/comma/leading minus; `parseFormattedNumber` re-validates independently.
- Local draft state while focused (otherwise typing `1,` gets stomped by a re-render from the already-parsed store value).
- Formatting/rounding both happen on blur (mid-typing would move the caret).
- **A dot is always a thousands separator, never decimal** — locale choice; `1.5` typed with English habits gives `15`, known trade-off.
- Written by hand, not `Intl.NumberFormat` (needs exact round-trip with the custom parser; some locales use U+00A0 as group separator).
- Display decimals capped at 4 (`MAX_DISPLAY_DECIMALS`) so `0.1+0.2` doesn't paint 17 digits.
- **All numeric fields use the new control**, not just formatted ones (removed the string/number split in preview state).
- ICA template formats all 38 numeric fields, including the 4 unrounded ones.

## Decimals (`field.decimals`)

How many decimals a field **shows and lets you type**. `decimals?: number`, absent = up to `MAX_DISPLAY_DECIMALS`. Picker offers 0–4, not free input.

**Padding is presentation (`formatNumber`, doesn't lie); cutting is a value change** (`applyDecimals` in `fieldRounding`, alongside `applyRounding`).

Settled:
- **`roundToDecimals` scales instead of `toFixed`** — both symmetric with negatives, but `toFixed` follows the double's binary tail (`0.35` stored as `.34999...` → `toFixed(1)` = `0,3`, wrong reading of what's on screen). Scaling agrees with the printed value in all but 3 of 17 tested cases, and wins the tiebreak there. Neither is exact above certain precision.
- Above `MAX_SAFE_INTEGER`, returned untouched (precision already lost).
- **`decimals: 0` cuts pasted text at the comma**, not by dropping it (`1234,56` → `1234`, not `123456`).
- Fixed order — thousand, decimals, sign — in both application points.
- **Editing does not pad** (`toEditableText` keeps `6`, not `6,0`) — round trip must hold exactly.
- ICA declares `0` everywhere, `1` only on `tarifa_x_mil`.

## Negative values (`field.allowsNegative`)

A numeric field can refuse negatives — minus key blocked on typing, script results **clamped to 0**. `src/lib/fieldSign/`.

Like rounding, **changes the value** (not just display).

Settled:
- **Polarity inverted vs. rounding/formatted**: absent means negatives ARE allowed; only `allowsNegative: false` restricts. Flipping the default would silently start clamping every existing draft. `setFieldAllowsNegative` stores `false`, deletes `true`.
- `sanitizeNumericInput` takes a boolean, not the field — keeps `numberFormat` text-only.
- `PreviewNumberInput` clamps on blur too, in case a route other than the keyboard sets the value.
- **In `runtimeDerived`, clamp goes after rounding, before publishing** — same ordering reason as rounding.
- **The clamp reports itself** (`clampNegative` returns `{value, clamped}`, shown as "El cálculo dio negativo y se recortó a 0") — **simulator-only, not exported**.
- ICA turns it off on 27/38 numeric fields (25 plain `number` + renglones 10 and 16, the two calculated fields that can legitimately go negative). Others already self-clamp with `max(…, 0)` in-script.
- **Script-level `max(…,0)` and `allowsNegative` are not interchangeable** — renglón 38's negative *is* the normal saldo-a-favor case, so the flag (which warns) would be wrong there; the script clamp is silent by design.
- `min: 0` validations stay regardless (cover whatever a script writes).

## Length cap (`validations.maxLength`)

Offered for `text`, `textarea`, `number`, `calculated` (`LENGTH_CAPABLE_FIELD_TYPES`) — **counted differently**: characters for text types, **digits of the integer part** for numeric ones. `src/lib/fieldLength/`.

Not a new property — `validations.maxLength` already existed and already produced `z.string().max(n)`; what was missing was enforcement on typing and any handling for numeric fields. No `DRAFT_SCHEMA_VERSION` bump; only `ExportedField.maxLength` is new (additive).

Settled:
- **A number's cap counts digits, not on-screen characters** — the text is unstable across `formatted`/sign/decimals; counting integer digits keeps each property independent.
- **It never changes the value** — keyboard stops the extra digit; a `calculated` field that overflows *fails validation*, isn't silently shortened.
- **Travels twice on purpose**: inside the schema (the only thing the consumer can validate with) and as its own key (`ExportedField.maxLength`, so the keyboard can stop typing before a schema parse would).
- **Exported key is the loosest (base) reading** — a tightening override is caught only by `zodSchemaWhen`, never by blocking a legal keystroke.
- `z.number()` can't express it with `.max()` — uses a `.refine` on `Math.abs(Math.trunc(n)).toString().length <= n`; `capIntegerDigits` mirrors it on the text side.
- Cap of `0` reads as absent (`effectiveMaxLength`) — otherwise a number field becomes impossible to satisfy.
- `select` lost the dead "Longitud" fieldset (option-based fields go the `z.enum` branch, which never reads `minLength`/`maxLength`).
- ICA declares no cap — `numero_documento`'s 7–10 digit rule already lives in its `pattern`.

## Options and `apiBinding`

Option-based types (`select`, `search_select`, `toggle_group`, `radio_group`, `checkbox_group`) get **manually authored options only when excluded from the payload *and* declares no `dataSource`**; otherwise options are injected at runtime. Predicates in `src/lib/fieldOptions/fieldOptions.ts` — use `allowsManualOptions`, not an inline `apiBinding` check (exactly 4 call sites enforce this).

**Precedence the consumer applies:**
1. `options[]` present → use them (only ever emitted for excluded, no-`dataSource` fields).
2. `dataSource` present → query `dataSource.catalog`, gated by `dependsOn` if set.
3. Neither, `apiBinding.kind === "mapped"` → infer catalog from `apiBinding.path` (legacy fallback, most ICA selects still here).

**`options[]` and `dataSource` are mutually exclusive by construction** — `allowsManualOptions` returns false whenever `dataSource` is set, so the JSON can never carry both.

Settled:
- Dropping an option-field from the palette creates it with no options; `FieldOptionsModal` fires from `ApiMappingPanel` at exclusion time, skipped if the field already has a `dataSource`.
- Leaving excluded state, or declaring a `dataSource`, **discards** `options` — deliberate, not kept hidden.
- `buildZodSchema` only emits `z.enum` for excluded fields; mapped ones fall back to `z.string()`.
- `ConditionValueInput` offers a dropdown only for fields with *local* options — a mapped select degrades to free-text-by-id in condition editors.
- `checkbox` (single boolean) and `checkbox_group` (multi-select array) are **different types on purpose** — do not merge.
- `PAYLOAD_SCHEMA` has 75 leaves (53 number, 22 string, no boolean, no scalar arrays) — a `checkbox_group` has nowhere real to map. `fieldMatchesSchemaType` lets `checkbox` match `number` leaves (0/1) to avoid a permanent unavoidable type warning.
- `flattenLeaves`/`flattenSelectableLeaves(schema, arrayPath?)` stamp array-item leaves and filter by array context for group mapping.

### `field.inlineOptions` — options on one line

`inlineOptions?: boolean`, only `radio_group`/`checkbox_group` (`toggle_group` already horizontal, `select` has nowhere to put them). Absent = stacked. Predicates in `src/lib/fieldOptions/`; switch lives in `AttributesPanel`'s Diseño section (not `FieldOptionsEditor`, since catalog-fed fields need it too). **Presentation only** — doesn't touch value/schema/selection count; uses `flex-wrap`, not a promise everything fits.

### `dataSource.fills` — columns of the chosen option copied into other fields

`CatalogFill` = `{column: keyof CatalogOption, field}` — the target's id, resolved to a name on export. `src/lib/catalogFill/` (`resolveFills`, `hasFills`), panel `CatalogFillsEditor`. Models what the consumer already did hardcoded for `codigo_actividad`/`tarifa_x_mil`.

Settled:
- Declaration lives on the field that **originates** the selection (one owner, like `labelFor`).
- The fill writes into the scope of **the row it came from** — `useFormPreview.setValue` merges into that same group item, not row 1.
- Clearing the selection clears the targets too (a stale tarifa left behind would keep computing wrong).
- `catalogOptions` only built when the field declares fills (425-entry list, avoid rebuilding on every keystroke).
- A fill whose target no longer exists is dropped whole, same rule as a validation-override on a deleted field.
- **`actividades[].idActividad` still carries `idDeclaracion`, unconfirmed** — flipping to `codigoCIIU` is one line in the generator.

### `dataSource` — which catalog feeds a field

`FieldDataSource` = `{catalog, dependsOn?}`. `catalog` is a contract string the consumer maps to its own endpoint. **Orthogonal to `apiBinding`** ("where do options come from" vs. "does this value travel in the payload") — `departamento` proves it: `{kind:"excluded"}` (API only wants `idCiudad`) yet still `{catalog:"departamentos"}` for its own options.

Settled:
- `CATALOGS` is a closed dropdown list (`src/constants/catalog.ts`), never typed — same reasoning as `apiBinding.path` (a typo'd catalog name fails silently on the far side).
- Identifying a catalog by field `name` was rejected — breaks on rename, doesn't generalize.
- A `dataSource` never ships its options — export carries only the catalog name.
- No mock data still yields `placeholderOptions` — never a dead select.

### The catalog bank — real options for the simulator

`CatalogBank` = `Record<catalogId, {source, entries}>`, edited from the **Catálogos** tab, own `localStorage` key (`form-orchestrator-catalogs`), **never in the draft or export** (structurally, not by convention).

**Keyed by catalog, not by field** — one `departamentos` entry serves every form that needs it; per-field storage would have needed a "copy between forms" feature that this design makes unnecessary.

Settled:
- **Pasted, not typed** — `parseCatalogPaste(raw, keys)` digs the first array out of a `{data:[…]}`-style wrapper; author names the columns (`CatalogPasteKeys`). A tarifa that doesn't parse is dropped, not stored as `NaN`.
- **The bank wins whole, or not at all** — an active catalog with no match for the current parent still doesn't fall back to mock data (would mix real/fake in one dropdown).
- **`default`/`custom` is a per-catalog switch, not a modal prompt** — flipping to `default` keeps the pasted data. A global "which mode?" modal was rejected as either annoying or an unfindable one-time setting.
- `isSimulatedCatalog` takes the bank as an argument, so the "simulado" badge is actually true.
- **No HTTP** — deferred (CORS/auth/offline cost); pasting gets the same data for free.

### Fechas máximas de presentación — the second simulator-only bank

`FechasMaximasPresentacion` = `{municipioId, ica[], reteica[], autoretencionIca[]}`, each a `ReglaAnio` list. **Not in the export or draft** (verified by asserting neither ever mentions `municipioId`/`periodicidad`/`tipoDigito`/`autoretencionIca`). `src/lib/maxDates/` (arithmetic), `src/lib/maxDatesBank/` (`localStorage` layer, key `form-orchestrator-fechas`), `panels/MaxDatesPanel` (Fechas tab).

Settled:
- **Model is deliberately flat** — periodicity × digit-validation is 12 combinations, each `FechaLimite` carries its own `periodo`/`digito` rather than a discriminated union. `fechasEsperadas` derives expected count to catch half-loaded dumps early.
- Names stay in Spanish — this object *is* the API contract.
- **`digitoDe` returns `null`, not a number** — fixes two silent bugs: `Number("")===0` was picking the digit-0 deadline for an empty document; `NaN` from a lettered NIT matched nothing with no explanation.
- **Generated table is recomputed from the clock and read-only** (`generarReglasAnuales`); the offset (ICA=1 previous año gravable, retención=0 current) is the only difference between the two. Editing anything **forks a copy** (`source: "custom"`) rather than silently losing edits on the next regeneration.
- ReteICA/autorretención ship empty — inventing bimonthly/monthly deadlines nobody gave would be the same mistake as fake tarifas.
- Pasting takes the whole object (no column naming — the shape already matches). Paste and stored value share one Zod schema.
- Only `anual + ninguno` is hand-editable; everything else is paste-only (6–120 dates).
- Store holds no date logic — `setMaxDates` takes a finished table, all rules live in `lib/maxDates`.

### UVT y SMMLV — the third simulator-only bank

`ValorAnual` = `{anio, uvt, smmlv}`, one bank per year (`localStorage` key `form-orchestrator-valores`, `src/lib/valoresBank/`). **Not in draft/export** (verified: no `smmlv` or `1750905` in exported JSON).

**Deliberately NOT a `CatalogBank` entry** — a catalog is `{id,label}` options for a dropdown; this is two scalars per year with nothing to pick. UI is `ValoresAnualesEditor`, first section of `CatalogsPanel`.

Helpers `uvt(año)`/`smmlv(año)` (`src/lib/scriptValores/`), impure (built per run over `RuntimeContext`, since the table isn't exported).

Settled:
- **Return `null`, not `0`, when unloaded** — a `0` silently zeroes any floor/cap written in UVT; `null` forces the author to write a visible fallback (`const UVT = uvt() ?? 52374;`).
- No argument = current year, from `context.hoy` (never the real clock).
- `CONTEXT_HELPER_NAMES = [...DATE_HELPER_NAMES, ...VALUE_HELPER_NAMES]` — order matters, both `SCRIPT_PARAM_NAMES` and `runFieldScript` derive from it.
- `resolver` guards `context.valores` with `Array.isArray` (older consumer objects predate this key).
- **Bank wins whole, or not at all** — same as the catalog bank.
- Paste names its columns (flat list, no way to guess which key is the year); a row missing any of the three is discarded whole.
- **`leerNumero` tries the direct read before stripping separators** — the reverse order would mangle `"52374.00"` by two orders of magnitude.
- Factory table ships filled 2020–2026 from published DIAN/decree numbers — not invented data, unlike the tarifas gap. Check asserts both columns rise monotonically.

### `fechaLimite` / `diasDeMora` / `mesesDeMora` — the deadline table inside a script

`src/lib/scriptDates/`, names in `DATE_HELPER_NAMES`. `fechaLimite(año, periodo, documento)` → date string or `null`; `diasDeMora` → days late (`0` if on time); `mesesDeMora` → months/fraction late (the sanción's actual unit).

**`mesesDeMora` ≠ `diasDeMora / 30`** — only 4 months have 30 days, so division eventually overcharges a full month (5% of base). `mesesOFraccion` counts by calendar instead (verified against `31/01→28/02`=1, `31/03→30/04`=1, a full year=12 not 13).

**First impure helpers** — built per run, closing over `RuntimeContext = {reglas, hoy, valores}`, passed as a **second argument** to `resolveRuntime`/`validateRuntime` (never inside `RuntimeModel`, mirroring how the consumer gets the config JSON and the deadline table from different places).

Settled:
- Declaration kind resolved once at the top (`buildRuntimeModel` reads `projectMeta.formType`) — helpers never branch on ICA-vs-retención themselves.
- **`diasDeMora` returns `0`, not `NaN`, with no table loaded** — a sanción must never be born from missing data.
- Dates parsed by hand into UTC (`aUtc`) — `new Date("2025/03/31")` (local) vs `"2025-03-31"` (UTC) differ by a day depending on timezone, and a day here decides on-time vs. late. Also round-trips to catch invalid dates like 31 Feb.
- `hoy` is a parameter, not a clock read — makes mora testable without touching system time.
- No graph changes needed — `{campo}` inputs are already scanned as reads.
- Names come from `DATE_HELPER_NAMES` in both places (same anti-drift trick as `SCRIPT_HELPER_VALUES`).
- Used by renglón 31 (`mesesDeMora`) and renglón 37 (`fechaLimite`, `diasDeMora`).

## Sanciones (renglón 31)

The **sanción por extemporaneidad** (art. 641 ET) auto-liquidates. The rule lives **entirely inside renglón 31's `logic.script`** — municipal parameters, base choice, and formula all in one place. `SANCION_EXTEMPORANEIDAD_SCRIPT` is only the seed text; from creation it's ordinary `logic.script`, editable by the form's author.

**Do not move any part of it into code or the prelude.** Tried the other way (helper + params in the prelude) and rejected: a municipality asking to change the rate means whoever handles it has to already know the prelude holds part of the logic. The user's own experience (four months building strictly to the law, then told "too strict, put it back") is the reason. **The law is the default, never the constraint.**

Script declares `UVT` (`uvt() ?? 52374`), `MINIMA_UVT`, `POR_MES`, `TOPE`, `base` as named constants with a comment on each. Shipped defaults are the legal ceiling (10 UVT min, 5%/month, 100% cap) — the law is a maximum a municipality may only lower.

Settled:
- **Base is renglón 25** (`total_impuesto_a_cargo`) — 33/34/35/38 already sum in `valor_sancion`, so using them would close a `fieldGraph` cycle. Coincides with art. 644 §3. **Consequence: saldo-a-favor-based caps are structurally impossible here**, documented at the `const base` line.
- **`valor_sancion` stays `type:"number"`, no `alwaysDisabled`** — the script's own `return`/`return undefined` is the only lock mechanism, since three other `tipo_sancion` values need the field to stay typeable.
- Only EXTEMPORANEIDAD auto-liquidates — first line compares against `TIPO_SANCION_EXTEMPORANEIDAD`, returns `undefined` otherwise (including "nothing selected yet").
- **"No lateness" is checked before the minimum** — same fail-open family as `mesesDeMora`/`0`.
- Period argument is `const periodo = 1` (ICA is annual) — a bimonthly municipality changes one line.
- Rounds to the thousand like every renglón (10 UVT floor lands as 524.000, not 523.740).

### What is deliberately NOT built

- **Sanción por corrección (art. 644)** — all three variants need the *prior* declaration, which doesn't exist yet (system newly deployed, no history to diff). Documentation-only by explicit instruction.
- **Art. 642** (post-emplazamiento) — needs a flag from an intro modal that doesn't exist; defaulting to the harsher rate isn't defensible.
- **Ingresos-brutos/patrimonio-líquido branches of art. 641** — patrimonio líquido isn't a field at all; ingresos branch is buildable but nobody's confirmed these municipalities use it.
- **Gradualidad (art. 640)** — same missing-history blocker as corrección.

## Intereses de mora (renglón 37)

Same shape as the sanción: whole rule inside `logic.script` (`INTERES_MORA_SCRIPT` seed). Formula (art. 634-635 ET): **`base × (TASA_ANUAL / DIAS_ANIO) × días`**, daily/simple, rounded **up** to the thousand. Rate = tasa de usura (Superfinanciera) − 2 points, **the rate at time of payment applies to the whole delay** (why one constant is correct instead of a per-period table). Ships August 2026 value (27,66% E.A.).

Settled:
- **`const base = {valor_a_pagar};` is meant to be edited** per municipality — falls out of `{campo}` substitution for free. **Only renglón 38 is illegal** as a base (consumes the interest itself, would close a cycle); 33/34/35/25 were all checked against `fieldGraph` and don't.
- **Default base is renglón 35** — inherits 33's `max(…,0)`, so a saldo a favor charges zero interest on a non-debt.
- **Rounding is `ceil`, done in the script** (matches the municipality's `ROUNDUP(…;-3)`) — the one renglón whose rounding isn't the project's default round-to-nearest; `applyRounding` afterward is a no-op since the value is already a multiple of 1000.
- **`fechaLimite` decides whether to compute at all; `diasDeMora` only supplies the number** — they look redundant but aren't: `diasDeMora=0` means either "on time" or "no table loaded", which must not be treated the same. `fechaLimite === null` → script returns `undefined`, field stays typeable (a locked `0` would be indistinguishable from a real on-time result).
- `type:"number"`, no `alwaysDisabled` — same script-owns-the-lock mechanism as renglón 31.
- Rate is a script constant, not a fourth bank — no need to segment by period since the law applies the payment-date rate to the whole delay; a values-bank column would be wrong by construction (that table is annual, this rate is monthly).

### The script editor got a ceiling

`ScriptEditor` (CodeMirror) had no max height, so a ~50-line script pushed error messages/cycle warnings below the fold in the sidebar. `ScriptInput` now computes `maxHeight` from a `maxRows` prop (default 18), `.cm-scroller` gets explicit `overflow:auto`, both travel as inline style (CodeMirror takes no classes).

## Conditional validations (`validations.overrides`)

A field's validation can change with another field's value. `FieldValidationOverride` = `{id, when: FieldCondition, validations: FieldValidationRules}`. `FieldValidationRules` is kept separate from `FieldValidations` **so an override can't nest overrides**.

Exported as `validations: {zodSchema, zodSchemaWhen?: [{when, zodSchema}]}` — **consumer walks `zodSchemaWhen` in order, first match wins; else `zodSchema`** (`effectiveSchemaSource`, shared by `collectErrors` and the required asterisk so the simulator can't drift).

Motivating case: `numero_documento` needs 7–10 digits normally but 7–9 when `tipo_documento` is NIT (10th digit is the separately-modeled DV). Three fields (contribuyente/declarante/responsable) each observe their **own** `tipo_documento`.

Settled:
- **An override merges onto the base**, doesn't replace it (`mergeValidationRules` skips `undefined` keys) — clearing a panel input reverts to inherit, it doesn't store `0`/`""`.
- Rejected alternative: two fields swapped by `visibleWhen` sharing a payload leaf — doubles the field count and breaks `buildPathIndex`'s one-path-one-entry assumption.
- **Not edges in `fieldGraph`** (observes a field, no value flows through). `removeField` still prunes overrides pointing at it (dropped whole, not partially).
- `persistence.schema.ts` had to learn the shape (Zod strips unknown keys — any future `FieldValidations` addition needs the same line).

## Conditions (`visibleWhen` / `enableWhen` / `alwaysDisabled`)

Both share the `FieldCondition` type, operator set, store shape and the whole `ConditionEditor`/`useConditionEditor` machinery — `kind: "enable"|"visible"` is the only difference. Operator semantics in `src/lib/fieldCondition/fieldCondition.ts`: `operatorNeedsValue`, `operatorTakesList`, `operatorIsStringBased`, `parseConditionList`, `operatorsForFieldType` (narrows per type — `checkbox` only gets truthy/falsy, `file` only empty/not-empty).

**Precedence, in order:**
1. `visibleWhen` false → not rendered, not validated. Nothing below applies.
2. `alwaysDisabled` → rendered, read-only.
3. `enableWhen` false → rendered, disabled.

Settled:
- **A hidden field's Zod schema still exports unchanged** (`buildZodSchema` knows nothing about `visibleWhen`) — the consumer must drop hidden fields from its resolver itself. Same coordinated-consumer arrangement as `logic.script`.
- Visibility is editable even when `alwaysDisabled` is on (hiding a read-only field is legitimate); the enable editor itself is hidden in that case.
- `wouldCreateCycle` walks **every** edge kind (a cycle can span condition and script edges).
- `LogicPanel`'s candidate list is `formSteps`-only — a form-step field cannot condition on an intro-modal field (untouched limit, not a decision; revisit if needed).

## Commit conventions

- Spanish, present tense, imperative ("Agrega X", "Corrige Y", "Amplía Z") — matches existing history.
- Subject under ~72 chars, specific.
- **Bodies short — 3-4 lines max, often none.** Durable detail belongs in `CLAUDE.md`/README, not commit history.
- No `Co-Authored-By: Claude` trailer unless explicitly asked.
- One commit per cohesive feature/decision; split only when parts are genuinely independent.
- **Stage by explicit path** — never `git add -A`/`git add src` (user often has unrelated WIP).
- Line-ending noise: `.gitattributes` normalizes to LF; if `git status` isn't clean, run `git add --renormalize .` once, separately from feature commits.
- On Windows, write the message to a file and use `git commit -F <file>` (PowerShell here-strings are unreliable through the tool layer).

## Commands

Package manager is **pnpm** — use `pnpm install`/`pnpm add`, not npm/yarn/bun.

- `pnpm dev` — Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then production build
- `pnpm lint` / `pnpm lint:fix` — Biome check / with auto-fix
- `pnpm format` — Biome format, write mode
- `pnpm preview` — preview production build
- `pnpm exec tsx <script>.ts` — throwaway verification script

No test runner configured. **Biome is the enforced linter/formatter** (2-space indent, double quotes, semicolons, 100-char width, auto-organizes imports); `eslint.config.js` exists but isn't wired into a script. `pnpm build` occasionally exceeds a 2-minute tool timeout (harness kill, exit 143, not a build failure) — re-run with a longer timeout before reporting a problem.

### Migrated from bun

bun filled two roles; pnpm only replaces package management (that swap was free — no bun APIs/config anywhere). bun's second role, **running TypeScript directly**, is now `tsx` (a devDependency; scratchpad scripts run under `pnpm exec tsx`).

Settled:
- **`pnpm-workspace.yaml` carries `allowBuilds`, not `package.json`** — pnpm 11 moved this out of `package.json`, where it's now silently ignored with only a warning. Needed for `@biomejs/biome` and `esbuild` (via tsx), which download platform binaries at install.
- **`reicon-react` pinned to exact `1.1.2`** — `^` ranges pull `1.2.0`, which renamed 10 icon exports in a minor (`Maximize22`→`Maximize2`, etc.) and breaks the typecheck.
- Other bumps were verified, not assumed (Biome 2.5.2→2.5.9 reformatted nothing; Vite 8.1.1→8.2.2 re-partitioned chunks but both lazy boundaries still hold, verified by grep).
- The 1132 extensionless imports didn't need fixing (normal for `moduleResolution: bundler`; tsx resolves them like bun did — Node's own loader is the one that can't).
- Scratchpad needs: `package.json` with `{"type":"module"}` (top-level await), absolute imports as `file:///C:/...` URLs, and a `node_modules` junction to the project.

## Architecture

Visual drag-and-drop **step-by-step form builder** ("Form Orchestrator") that compiles its config to one structured JSON document.

### File layout conventions

Atomic design: `src/components/atoms|molecules|organisms/` + `src/components/layout/`. Panels in `organisms/panels/`. Each component/hook gets its **own folder** with co-located `X.tsx`/`X.types.ts`/`X.constants.ts`/`X.utils.ts` (only what's needed). Hooks: `src/hooks/useX/useX.ts`. Libs: `src/lib/<name>/<name>.ts`, same suffixes.

`X.ts` is the module's public API — helpers/constants/types belong in co-located files, not inline.

**A co-located `X.types.ts`/`X.constants.ts` is private to its folder.** The moment code outside that folder imports it, the declaration moves to `src/types/`/`src/constants/` (both directions audited to zero, kept that way). When the leaking declaration drags neighbours along, **move the whole file** rather than splitting it (`types/exportForm.ts`, `types/payloadMapping.ts`). Genuinely private stuff stays put (`FieldSpec` in `baseTemplate`, `TopologicalResult` in `fieldGraph`, `SALDO_NETO`, `CONDITION_COPY`, tokenizer regexes).

Not tool-enforced — Biome's `noRestrictedImports` doesn't fit (matches exact specifiers only, and the same target is spelled differently from every importer); verified with throwaway audit scripts instead.

Both import cycles this shape produced are fixed the same way: implementation moved to `.utils.ts` (`findFieldById` → `formStore.utils.ts`, `fieldMatchesSchemaType` → `payloadMapping.utils.ts`), public file re-exports it. One remaining cycle (`types/field.ts` ↔ `types/catalog.ts`) is harmless — type-only, erases at compile.

### Pieces

- **Setup wizard** (`SetupWizardModal/`, `useSetupWizard/`): 2-step modal when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads the ICA template (`src/lib/baseTemplate/`), others start blank. Step 2 configures the intro modal, seeding `introModal.steps`. `DraftRecoveryModal` runs before it on mount if `loadDraft()` finds a saved draft.
- **ICA template** (`src/lib/baseTemplate/`): 8 steps built from `FieldSpec` rows. Computed renglones are `type:"calculated"` + `script` + `alwaysDisabled` (13 of them) — **except renglón 31**, deliberately neither (see Sanciones). `SALDO_NETO` is the shared subexpression behind 33/34 (a-cargo/a-favor), a bare expression interpolated into two `return max(…)` scripts.

  **The 33/34→35→38→40 tail encodes an unwritten rule**: 35 is just 33 (saldo a favor → nothing to pay, no condition needed), and 38 = `max(35 − 36 + 37 − 34, 0)` — **the `− 34`** keeps intereses de mora from charging against a debt that doesn't exist; below zero it's already stated in 34, so 38 doesn't repeat it as a negative. Some municipalities want the opposite (signed 35/38/39/40) — **not built**, a per-municipality change to make when asked, not a mode to carry now.

  **`calculated` and `number` are behaviourally identical today** (same Zod case, same preview control, same numeric properties) — the only difference is the palette label. **`alwaysDisabled` is what actually locks a field**, applied in `formRuntime.utils.ts` (takes precedence over `enableWhen`).
- **State** — single Zustand store, `src/store/formStore.ts`, typed by `formStoreTypes.ts` + domain files (`field.ts`, `formStructure.ts`, `setup.ts`, `placement.ts`, `ui.ts`, `store.ts`). Constructors/walkers in `formStore.utils.ts`; `formStore.constants.ts` holds `THEME_STORAGE_KEY` and `NO_ROWS`/`NO_GROUPS` sentinels.

  **`store/banksSlice.ts` lives outside `formStore.ts`** — the three simulator-only banks (`catalogBank`, `maxDates`, `valores`), spread into the store (`...createBanksSlice(set)`) so every consumer still uses ordinary `useFormStore((s) => s.setValores)`. They share nothing with the rest: never touch `formSteps`/`introModal`, never enter the draft, never reach the export. Takes only `set` (no bank action reads outside state); splitting anything else out has the same 100-column `create<FormState>(…)` trap.
  - `formSteps[]` — multi-step, each with `stepId`/`title`/`subtitle?`/`rows`/`groups?`.
  - `introModal.steps[]` — same minus `groups`.
  - `formScript` — the shared prelude.
  - `activeCanvas`: `{type: "formStep"|"introStep", stepId}`.
  - UI state: `selectedFieldId`, `isSidebarOpen`, `sidebarTab`, `rightSidebarTab`, `canvasViewMode`, `canvasZoom`, `dragPlacement`, `rowDropTarget`, `rowDrag`, `draggingFieldId`, `hoveredTransferTarget`, `transferNotice`, `isDarkMode` (persisted separately), `lastSavedAt`.
  - `setupConfig` + the three banks (each own `localStorage` key, none in draft/export).
  - Selectors: `getActiveRows`, `getActiveGroups`, `findFieldById`, `getAllFields`, `findRowContainingField`, `findRowById`.
  - Row/field mutations apply uniformly via `mapRowEverywhere`/`mapFieldEverywhere`. Key actions: `addFieldToRow`, `moveField`, `removeField`, `updateField`, `setFieldName`, `updateFieldValidations/Styles/FileConfig`, `updateFieldApiBinding`, `setFieldScript`, `setFormScript`, `setFieldRounding/Formatted/AllowsNegative/Decimals/LabelFor/Content`, `addFieldRule`/`updateFieldRule`/`removeFieldRule`/`reorderFieldRule`, `addFieldOption`/`removeFieldOption`/`updateFieldOptionLabel`, `setFieldEnableWhen`/`setFieldVisibleWhen`, `addRowToActiveCanvas`/`updateRowColumns`/`removeRow`/`moveRow`, `moveFieldToStep`/`moveRowToStep`, `addGroupToActiveStep`/`addRowToGroup`/`updateGroup`/`removeGroup`, step actions, `restoreDraft`.
  - **Selectors must return stable references** — Zustand's `useSyncExternalStore` compares by identity; a fresh `[]` per call causes "Maximum update depth exceeded" (hence `NO_ROWS`/`NO_GROUPS`).
- **Field model** (`CanvasField`, `src/types/field.ts`): `name` (unique slug), `type`, `label`, `colStart`, `colSpan`, `validations`, `styles`, `logic`, plus optional `title`, `options[]`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `rounding`, `formatted`, `allowsNegative`, `decimals`, `enableWhen`, `visibleWhen` (`FieldCondition = {fieldId, operator, value}`). Operators: `equals|notEquals|greaterThan|lessThan|startsWith|endsWith|contains|matches|in|isEmpty|isNotEmpty|isTruthy|isFalsy`. `logic` = `{script?, rules?}`. Types in `FIELD_TYPES` (`src/constants/fieldTypes.ts`), grouped **básicos** (text, number, select, textarea, checkbox, calculated, file), **complejos** (search_select, toggle_group, radio_group, checkbox_group), **contenido** (label, rich_text). Adding a type is just a `FIELD_TYPES` entry (`PALETTE_SECTIONS` skips empty categories).
- **Grid**: `src/constants/grid.ts` — `GRID_BASE_COLUMNS = 16` default; rows carry their own `columns` (clamped 1–24), shrinking clamps field `colSpan`s to fit.
- **Three-slot layout** (`AppLayout.tsx`: `sidebar`, `canvas`, `rightSidebar`):
  - Left sidebar (`Sidebar/`): icon rail (`SidebarTabRail`, includes dark-mode toggle) over a tabbed panel — `SidebarTab` = `fields|attributes|validations|styles|logic|apiMapping|catalogs|fechas`. `fields`, `catalogs`, `fechas`, and `logic` (renders the prelude) work with no field selected. `LogicPanel` hosts `FieldScriptEditor`, `FieldRulesEditor`, `ConditionEditor` (×2, by `kind`). `FileOptionsEditor`/`NumberOptionsEditor`/`FieldOptionsEditor` handle type-specific config. This is the panel that still collapses (click the active tab).
  - Canvas (`Canvas/Canvas.tsx`): owns the full height of the window. Grid drop targets (`@dnd-kit` `useDroppable` per row), laid out by `CanvasRowsGrid` (blocks consecutive same-group rows into `RepeatableGroupBand`); `RowColumnsMenu` + `FieldResizeHandle`/`useFieldResize` for column count/`colSpan`; `FieldContextMenu` (right-click) for per-field actions; `JsonPreviewCanvas`/`PayloadPreviewCanvas` swap in by `canvasViewMode`. Intro-modal canvas renders inside a decorative fake-modal frame.
  - Right panel (`RightSidebar/`): action row (`SaveButton`, Simulador, Exportar) over a text tab strip carrying `CanvasZoomControl`, over the blocks of the active tab — view mode and project info under **Proyecto**; `CanvasTabs` (which switches `activeCanvas`) and `StepTitleEditor` under **Steps**. `TransferNotice` shows above both. See "The right panel".
  - Drag-and-drop wiring in `src/hooks/useDragAndDrop/`; `App.tsx` only wires `DndContext`/`DragOverlay`. Every palette drop creates the field directly; options are configured later.
- **Payload mapping** (`src/lib/payloadSchema/`, `src/lib/payloadMapping/`): `PAYLOAD_SCHEMA` is the hardcoded `DeclaracionIcaE` contract. `buildMappingTree` pairs leaves with bound fields, flags type mismatches/orphans/host-provided leaves; rendered by `PayloadPreviewCanvas`.
- **Persistence** (`useAutosave/`, `src/lib/persistence/persistence.ts`): autosaves on interval once setup is complete; Ctrl/Cmd+S via `useKeyboardShortcuts/`. `loadDraft`/`clearDraft` back the recovery modal. Draft carries `schemaVersion`, **migrates before validating** (the reverse order would discard old drafts precisely when migration could save them). Migration steps in `persistence.migrations.ts`, indexed by source version, work on the raw object (no shape assumed) — a gap in the chain stops the walk and the version rejection kicks in. **Every shape change needs a migration step**; `z.object` silently strips undeclared keys, so skipping the step loses data without a word. A purely additive optional key (like `rounding`) needs no version bump, just its `persistence.schema.ts` line — forgetting that line is the same silent-strip trap from the other direction.
- **Output** (`src/lib/exportForm/`): `downloadFormExport`/`buildFormExport` serialize `projectMeta`, `setupConfig.introModal`, `formSchema.steps[]` (each field's `colStart`/`colSpan`/`styles`/`validations.zodSchema`/`logic`/`options`/`fileConfig`/`alwaysDisabled`/`apiBinding`/`labelFor`/`content`/`tooltip`/`rounding`/`formatted`/`allowsNegative`/`decimals`/`enableWhen`/`visibleWhen`) plus `groups[]` (`min`/`max`/`arrayPath`, array Zod schema, `checks[]`) and `rows[].groupId`, plus `formSchema.gridBaseColumns`/`prelude` (sent once, not repeated per `compiled`). Field ids in conditions/rules/`labelFor` are **resolved to names** on export. `validations.zodSchema` is optional — its absence is how the consumer knows there's nothing to validate.

### Prescribed stack

- `@dnd-kit/core` + `@dnd-kit/sortable` (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` (Zod schemas authored dynamically per-field, stored as strings)
- `zustand` for the builder state tree
- Tailwind v4 (`@tailwindcss/vite`), no CSS-in-JS, class-based dark mode — every new surface needs `dark:` variants
- `uuid` for ids
- `reicon-react` for icons (not lucide/heroicons)
- `@codemirror/*` + `@lezer/highlight` for the script editor — picked over Monaco (spec's original ask) for weight, since TS diagnostics aren't needed (script is JS). Only loads behind `ScriptInput`'s `React.lazy`.

### Code style

- **Comments in Spanish, `//` only — never JSDoc `/** */`** (JSDoc restates the signature's own types, rots first). No accents, matching existing style.
- **`src/lib/`, `src/store/`, `src/hooks/` carry a header comment per file** stating its role/boundary, plus targeted comments only where there's a trap, an invariant the code can't express, or a discarded alternative. High bar: if deducible from the line below, don't write it.
- `src/components/` is not commented as a matter of course — add one only when a component hides a real decision.
- **Explicit type annotations** on local declarations, matching existing files.
- Biome conventions win over `eslint.config.js` (not wired into a script).
