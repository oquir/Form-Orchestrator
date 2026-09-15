import type { ProjectFileLoad, ProjectFileSummary } from "../../types/projectFile";

export interface UseProjectImportResult {
  fileName: string | null;
  result: ProjectFileLoad | null;
  summary: ProjectFileSummary | null;
  isReading: boolean;
  canOpen: boolean;
  pickFile: (file: File) => Promise<void>;
  openProject: () => void;
}
