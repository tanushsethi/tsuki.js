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
      children: children.map(toElement),
    },
  };
}

function toElement(child: TsukiChild): TsukiElement {
  if (typeof child === "function") {
    return {
      type: "REACTIVE_TEXT",
      props: {
        text: child,
        children: [],
      },
    };
  }

  if (typeof child === "object") {
    return child;
  }

  return createTextElement(child);
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
