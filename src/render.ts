import type { Fiber } from "./fiber";
import { prepareHooks } from "./hooks";
import type { TsukiComponent, TsukiElement } from "./types";

export const Fragment = "FRAGMENT";

const isEvent = (key: string) => key.startsWith("on");

const isProperty = (key: string) =>
  key !== "children" && key !== "key" && !isEvent(key);

const keyOf = (props: TsukiElement["props"]) =>
  props.key === undefined ? undefined : String(props.key);

const eventName = (key: string) => key.toLowerCase().slice(2);

function updateDom(
  dom: Node,
  previous: TsukiElement["props"],
  next: TsukiElement["props"]
): void {
  Object.keys(previous)
    .filter(isEvent)
    .filter((key) => !(key in next) || previous[key] !== next[key])
    .forEach((key) => {
      dom.removeEventListener(eventName(key), previous[key] as EventListener);
    });

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

  Object.keys(next)
    .filter(isEvent)
    .filter((key) => previous[key] !== next[key])
    .forEach((key) => {
      dom.addEventListener(eventName(key), next[key] as EventListener);
    });
}

function createDom(type: string, props: TsukiElement["props"]): Node {
  const dom =
    type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(type);

  updateDom(dom, { children: [] }, props);

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
  const oldChildren: Fiber[] = [];
  const oldIndexes = new Map<Fiber, number>();
  const oldByKey = new Map<string, Fiber>();

  for (let old = fiber.alternate?.child; old; old = old.sibling) {
    const key = keyOf(old.props);

    oldIndexes.set(old, oldChildren.length);
    oldChildren.push(old);

    if (key !== undefined) {
      oldByKey.set(key, old);
    }
  }

  const reused = new Set<Fiber>();
  let furthestReused = -1;
  let previous: Fiber | undefined;

  elements.forEach((element, index) => {
    const key = keyOf(element.props);
    const candidate = key === undefined ? oldChildren[index] : oldByKey.get(key);

    const old =
      candidate &&
      !reused.has(candidate) &&
      candidate.type === element.type &&
      keyOf(candidate.props) === key
        ? candidate
        : undefined;

    let child: Fiber;

    if (old) {
      const oldIndex = oldIndexes.get(old) ?? 0;

      reused.add(old);

      child = {
        type: old.type,
        dom: old.dom,
        props: element.props,
        parent: fiber,
        alternate: old,
        effectTag: oldIndex < furthestReused ? "PLACEMENT" : "UPDATE",
      };

      furthestReused = Math.max(furthestReused, oldIndex);
    } else {
      child = {
        type: element.type,
        props: element.props,
        parent: fiber,
        effectTag: "PLACEMENT",
      };
    }

    if (previous) {
      previous.sibling = child;
    } else {
      fiber.child = child;
    }

    previous = child;
  });

  oldChildren
    .filter((old) => !reused.has(old))
    .forEach((old) => {
      old.effectTag = "DELETION";
      deletions.push(old);
    });
}

function updateHostComponent(fiber: Fiber, type: string | undefined): void {
  if (!fiber.dom && type !== undefined && type !== Fragment) {
    fiber.dom = createDom(type, fiber.props);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function updateFunctionComponent(fiber: Fiber, component: TsukiComponent): void {
  prepareHooks(fiber);

  reconcileChildren(fiber, [component(fiber.props)]);
}

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
  const type = fiber.type;

  if (typeof type === "function") {
    updateFunctionComponent(fiber, type);
  } else {
    updateHostComponent(fiber, type);
  }

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

    if (current.alternate && current.dom) {
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
