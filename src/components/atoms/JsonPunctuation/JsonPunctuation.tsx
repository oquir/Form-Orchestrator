import type { ReactNode } from "react";
import { JSON_PUNCTUATION_COLOR } from "./JsonPunctuation.constants";

export function JsonPunctuation({ children }: { children: ReactNode }) {
  return <span className={JSON_PUNCTUATION_COLOR}>{children}</span>;
}
