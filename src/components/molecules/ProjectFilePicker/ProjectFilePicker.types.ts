import type { ProjectFileLoad, ProjectFileSummary } from "../../../types/projectFile";

export interface ProjectFilePickerProps {
  fileName: string | null;
  result: ProjectFileLoad | null;
  summary: ProjectFileSummary | null;
  isReading: boolean;
  onPick: (file: File) => void;
}
