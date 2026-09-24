import { CodeBlock } from "../../atoms/CodeBlock/CodeBlock";
import { CopyIconButton } from "../../atoms/CopyIconButton/CopyIconButton";
import { PanelSection } from "../PanelSection/PanelSection";
import { SCHEMA_DESCRIPTION } from "./GeneratedSchemaPreview.constants";

export function GeneratedSchemaPreview({ schema }: { schema: string }) {
  return (
    <PanelSection
      title="Esquema Zod generado"
      description={SCHEMA_DESCRIPTION}
      aside={<CopyIconButton value={schema} title="Copiar el esquema" />}
    >
      <CodeBlock>{schema}</CodeBlock>
    </PanelSection>
  );
}
