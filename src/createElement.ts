import type { TsukiChild, TsukiComponent, TsukiElement } from "./types";

export function createElement(
  type: string | TsukiComponent,
  props?: Record<string, unknown> | null,
  ...children: TsukiChild[]
): TsukiElement {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(nodeValue: string | number): TsukiElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue,
      children: [],
    },
  };
}
