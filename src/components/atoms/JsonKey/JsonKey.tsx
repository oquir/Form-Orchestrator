import type { ReactNode } from "react";
import { colorForKeyValue } from "./JsonKey.utils";

export function JsonKey({ name, value }: { name: string; value: unknown }): ReactNode {
  return <span className={colorForKeyValue(value)}>{JSON.stringify(name)}</span>;
}
