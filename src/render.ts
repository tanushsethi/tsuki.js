import type { Fiber } from "./fiber";
import type { TsukiElement } from "./types";

export const Fragment = "FRAGMENT";

const isEvent = (key: string) => key.startsWith("on");

const isProperty = (key: string) => key !== "children" && !isEvent(key);

const eventName = (key: string) => key.toLowerCase().slice(2);

function updateDom(
  dom: Node,
  previous: TsukiElement["props"],
  next: TsukiElement["props"]
): void {
  Object.keys(previous)
    .filter(isProperty)
    .filter((key) => !(key in next))
    .forEach((key) => {
      (dom as unknown as Record<string, unknown>)[key] = "";
    });

  Object.keys(next)
    .filter(isProperty)
    .filter((key) => previous[key] !== next[key])
    .forEach((key) => {
      (dom as unknown as Record<string, unknown>)[key] = next[key];
    });
}

function addListeners(dom: Node, props: TsukiElement["props"]): void {
  Object.keys(props)
    .filter(isEvent)
    .forEach((key) => {
      dom.addEventListener(eventName(key), props[key] as EventListener);
    });
}

function createDom(type: string, props: TsukiElement["props"]): Node {
  const dom =
    type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(type);

  updateDom(dom, { children: [] }, props);
  addListeners(dom, props);

  return dom;
}

function domParentOf(fiber: Fiber): Node | undefined {
  let ancestor = fiber.parent;

  while (ancestor && !ancestor.dom) {
    ancestor = ancestor.parent;
  }

  return ancestor?.dom;
}

function reconcileChildren(fiber: Fiber, elements: TsukiElement[]): void {
  let oldFiber = fiber.alternate?.child;
  let previous: Fiber | undefined;

  elements.forEach((element) => {
    const old = oldFiber;

    const child: Fiber =
      old && old.type === element.type
        ? {
            type: old.type,
            dom: old.dom,
            props: element.props,
            parent: fiber,
            alternate: old,
            effectTag: "UPDATE",
          }
        : {
            type: element.type,
            props: element.props,
            parent: fiber,
            effectTag: "PLACEMENT",
          };

    if (old && old.type !== element.type) {
      old.effectTag = "DELETION";
      deletions.push(old);
    }

    oldFiber = old?.sibling;

    if (previous) {
      previous.sibling = child;
    } else {
      fiber.child = child;
    }

    previous = child;
  });

  while (oldFiber) {
    oldFiber.effectTag = "DELETION";
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
  const type = fiber.type;

  if (!fiber.dom && type !== undefined && type !== Fragment) {
    fiber.dom = createDom(type, fiber.props);
  }

  reconcileChildren(fiber, fiber.props.children);

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
let currentRoot: Fiber | undefined;
let deletions: Fiber[] = [];

function commitWork(fiber: Fiber | undefined): void {
  let current = fiber;

  while (current) {
    if (current.effectTag === "PLACEMENT" && current.dom) {
      domParentOf(current)?.appendChild(current.dom);
    }

    if (current.effectTag === "UPDATE" && current.dom && current.alternate) {
      updateDom(current.dom, current.alternate.props, current.props);
    }

    commitWork(current.child);

    current = current.sibling;
  }
}

function commitDeletion(fiber: Fiber): void {
  if (fiber.dom) {
    domParentOf(fiber)?.removeChild(fiber.dom);
    return;
  }

  let child = fiber.child;

  while (child) {
    commitDeletion(child);

    child = child.sibling;
  }
}

function commitRoot(): void {
  deletions.forEach(commitDeletion);

  commitWork(wipRoot?.child);

  currentRoot = wipRoot;
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
    alternate: currentRoot,
  };

  deletions = [];
  nextUnitOfWork = wipRoot;

  requestIdleCallback(workLoop);
}
