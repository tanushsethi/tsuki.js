import type { TsukiElement } from "./types";

export function render(element: TsukiElement, container: Node): void {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
