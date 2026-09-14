import type { TsukiChild, TsukiElement } from "./types";

export function createElement(
  type: string,
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
