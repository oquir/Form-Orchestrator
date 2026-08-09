import type { ReactNode } from "react";

export interface LabeledRangeSliderProps {
  id: string;
  label: ReactNode;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  // Rotulos de los extremos. Sin ellos el tirador no dice contra que escala se esta moviendo.
  minLabel?: string;
  maxLabel?: string;
}
