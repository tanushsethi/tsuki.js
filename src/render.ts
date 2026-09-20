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

function createDom(type: string, props: TsukiElement["props"]): Node {
  const dom =
    type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(type);

  setProps(dom, props);

  return dom;
}

function domParentOf(fiber: Fiber): Node | undefined {
  let ancestor = fiber.parent;

  while (ancestor && !ancestor.dom) {
    ancestor = ancestor.parent;
  }

  return ancestor?.dom;
}

function linkChildren(fiber: Fiber): void {
  let previous: Fiber | undefined;

  fiber.props.children.forEach((element) => {
    const child: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
    };

    if (previous) {
      previous.sibling = child;
    } else {
      fiber.child = child;
    }

    previous = child;
  });
}

function performUnitOfWork(fiber: Fiber): void {
  const type = fiber.type;

  if (!fiber.dom && type !== undefined && type !== Fragment) {
    fiber.dom = createDom(type, fiber.props);
  }

  if (fiber.dom && fiber.parent) {
    domParentOf(fiber)?.appendChild(fiber.dom);
  }

  linkChildren(fiber);
}

let nextUnitOfWork: Fiber | undefined;

export function render(element: TsukiElement, container: Node): void {
  nextUnitOfWork = {
    dom: container,
    props: { children: [element] },
  };

  const pending: Fiber[] = [];

  while (nextUnitOfWork) {
    const fiber = nextUnitOfWork;

    performUnitOfWork(fiber);

    let child = fiber.child;
    while (child) {
      pending.push(child);
      child = child.sibling;
    }

    nextUnitOfWork = pending.shift();
  }
}
