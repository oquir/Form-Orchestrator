import type { ComponentType } from "react";
import {
  AngleDownSquare,
  Bold,
  CheckSquare,
  CircleCompose2,
  Computing2,
  Copy,
  File,
  Hashtag,
  Magnifier,
  Tag,
  Text,
  TextBlock2,
  ToggleOn2,
} from "reicon-react";
import type { IconProps } from "../../../types/icon";

export const FIELD_TYPE_ICONS: Record<string, ComponentType<IconProps>> = {
  text: Text,
  number: Hashtag,
  select: AngleDownSquare,
  textarea: TextBlock2,
  checkbox: CheckSquare,
  calculated: Computing2,
  file: File,
  search_select: Magnifier,
  toggle_group: ToggleOn2,
  radio_group: CircleCompose2,
  checkbox_group: Copy,
  label: Tag,
  rich_text: Bold,
};
