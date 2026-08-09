import { CodeBlock } from "../../atoms/CodeBlock/CodeBlock";
import { CopyIconButton } from "../../atoms/CopyIconButton/CopyIconButton";
import { PanelSection } from "../PanelSection/PanelSection";

export function GeneratedSchemaPreview({ schema }: { schema: string }) {
  return (
    <PanelSection
      title="Esquema Zod generado"
      aside={<CopyIconButton value={schema} title="Copiar el esquema" />}
    >
      <CodeBlock>{schema}</CodeBlock>
    </PanelSection>
  );
}
