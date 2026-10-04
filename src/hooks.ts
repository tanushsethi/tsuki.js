import type { Fiber, Hook } from "./fiber";

let currentFiber: Fiber | undefined;
let currentHooks: Hook[] = [];
let hookIndex = 0;

export function prepareHooks(fiber: Fiber): void {
  currentFiber = fiber;
  currentHooks = [];
  hookIndex = 0;
  fiber.hooks = currentHooks;
}

export function useState<T>(initial: T): T {
  if (currentFiber === undefined) {
    throw new Error("useState can only be called while a component renders");
  }

  const previous = currentFiber.alternate?.hooks?.[hookIndex];
  const hook: Hook = { state: previous === undefined ? initial : previous.state };

  currentHooks.push(hook);
  hookIndex += 1;

  return hook.state as T;
}
