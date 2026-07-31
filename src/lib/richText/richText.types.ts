export interface MarkState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
}

export interface StyleLike {
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textDecorationLine?: string;
}

export interface DomLike {
  nodeType: number;
  nodeName: string;
  textContent: string | null;
  childNodes: ArrayLike<DomLike>;
  getAttribute?: (name: string) => string | null;
  style?: StyleLike;
}
