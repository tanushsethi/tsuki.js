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

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
  const type = fiber.type;

  if (!fiber.dom && type !== undefined && type !== Fragment) {
    fiber.dom = createDom(type, fiber.props);
  }

  linkChildren(fiber);

  if (fiber.child) {
    return fiber.child;
  }

  let current: Fiber | undefined = fiber;

  while (current) {
    if (current.sibling) {
      return current.sibling;
    }

    current = current.parent;
  }

  return undefined;
}

let nextUnitOfWork: Fiber | undefined;
let wipRoot: Fiber | undefined;

function commitWork(fiber: Fiber | undefined): void {
  let current = fiber;

  while (current) {
    if (current.dom) {
      domParentOf(current)?.appendChild(current.dom);
    }

    commitWork(current.child);

    current = current.sibling;
  }
}

function commitRoot(): void {
  commitWork(wipRoot?.child);

  wipRoot = undefined;
}

function workLoop(deadline: IdleDeadline): void {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (nextUnitOfWork) {
    requestIdleCallback(workLoop);
  } else if (wipRoot) {
    commitRoot();
  }
}

export function render(element: TsukiElement, container: Node): void {
  wipRoot = {
    dom: container,
    props: { children: [element] },
  };

  nextUnitOfWork = wipRoot;

  requestIdleCallback(workLoop);
}
