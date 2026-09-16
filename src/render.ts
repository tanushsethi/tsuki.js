import type { TsukiElement } from "./types";

export const Fragment = "FRAGMENT";

const isEvent = (key: string) => key.startsWith("on");

function setProps(dom: Node, props: TsukiElement["props"]): void {
  Object.keys(props)
    .filter((key) => key !== "children")
    .forEach((key) => {
      if (isEvent(key)) {
        dom.addEventListener(
          key.toLowerCase().slice(2),
          props[key] as EventListener
        );
      } else {
        (dom as unknown as Record<string, unknown>)[key] = props[key];
      }
    });
}

export function render(element: TsukiElement, container: Node): void {
  if (element.type === Fragment) {
    element.props.children.forEach((child) => render(child, container));
    return;
  }

  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  setProps(dom, element.props);

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
