import { PreviewGroupBand } from "../PreviewGroupBand/PreviewGroupBand";
import { PreviewRowsGrid } from "../PreviewRowsGrid/PreviewRowsGrid";
import type { PreviewStepProps } from "./PreviewStep.types";
import { toPreviewBlocks } from "./PreviewStep.utils";

export function PreviewStep({ step, preview }: PreviewStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-fg-strong">{step.title}</h2>
        {step.subtitle && <p className="text-xs text-fg-muted">{step.subtitle}</p>}
      </div>

      {toPreviewBlocks(step.rows).map((block) =>
        block.kind === "group" ? (
          <PreviewGroupBand
            key={block.groupId}
            groupId={block.groupId}
            rows={block.rows}
            preview={preview}
          />
        ) : (
          <PreviewRowsGrid
            key={block.rows[0].rowId}
            rows={block.rows}
            scope={preview.snapshot.root}
            preview={preview}
          />
        ),
      )}
    </div>
  );
}
