import type { Fiber, Hook } from "./fiber";

type StateUpdater<T> = (previous: T) => T;

let currentFiber: Fiber | undefined;
let currentHooks: Hook[] = [];
let hookIndex = 0;
let requestRerender: () => void = () => {};

export function prepareHooks(fiber: Fiber, rerender: () => void): void {
  currentFiber = fiber;
  currentHooks = [];
  hookIndex = 0;
  requestRerender = rerender;
  fiber.hooks = currentHooks;
}

export function useState<T>(
  initial: T
): [T, (action: T | StateUpdater<T>) => void] {
  if (currentFiber === undefined) {
    throw new Error("useState can only be called while a component renders");
  }

  const previous = currentFiber.alternate?.hooks?.[hookIndex];
  const hook: Hook = {
    state: previous === undefined ? initial : previous.state,
    queue: [],
  };

  (previous?.queue ?? []).forEach((action) => {
    hook.state =
      typeof action === "function"
        ? (action as StateUpdater<T>)(hook.state as T)
        : action;
  });

  const schedule = requestRerender;

  function setState(action: T | StateUpdater<T>): void {
    hook.queue.push(action);
    schedule();
  }

  currentHooks.push(hook);
  hookIndex += 1;

  return [hook.state as T, setState];
}
