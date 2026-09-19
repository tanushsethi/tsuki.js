import type { Fiber } from "./fiber";
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

function renderElement(element: TsukiElement, container: Node): void {
  if (element.type === Fragment) {
    element.props.children.forEach((child) => renderElement(child, container));
    return;
  }

  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  setProps(dom, element.props);

  element.props.children.forEach((child) => renderElement(child, dom));

  container.appendChild(dom);
}

let nextUnitOfWork: Fiber | undefined;

export function render(element: TsukiElement, container: Node): void {
  nextUnitOfWork = {
    dom: container,
    props: { children: [element] },
  };

  while (nextUnitOfWork) {
    const fiber = nextUnitOfWork;
    const parentDom = fiber.dom;

    if (parentDom) {
      fiber.props.children.forEach((child) => renderElement(child, parentDom));
    }

    nextUnitOfWork = undefined;
  }
}
