import type { EffectHook, Fiber, Hook, MemoHook, StateHook } from "./fiber";

type StateUpdater<T> = (previous: T) => T;

type EffectCallback = () => void | (() => void);

let currentFiber: Fiber | undefined;
let currentHooks: Hook[] = [];
let hookIndex = 0;
let requestRerender: () => void = () => {};
let pendingCleanups: Array<() => void> = [];
let pendingEffects: Array<() => void> = [];

const sameDeps = (
  previous: unknown[] | undefined,
  next: unknown[] | undefined
) =>
  previous !== undefined &&
  next !== undefined &&
  previous.length === next.length &&
  previous.every((value, index) => value === next[index]);

function startHook(name: string): Hook | undefined {
  if (currentFiber === undefined) {
    throw new Error(name + " can only be called while a component renders");
  }

  return currentFiber.alternate?.hooks?.[hookIndex];
}

function finishHook(hook: Hook): void {
  currentHooks.push(hook);
  hookIndex += 1;
}

export function prepareHooks(fiber: Fiber, rerender: () => void): void {
  currentFiber = fiber;
  currentHooks = [];
  hookIndex = 0;
  requestRerender = rerender;
  fiber.hooks = currentHooks;
}

export function flushEffects(): void {
  const cleanups = pendingCleanups;
  const effects = pendingEffects;

  pendingCleanups = [];
  pendingEffects = [];

  cleanups.forEach((cleanup) => cleanup());
  effects.forEach((effect) => effect());
}

export function runHookCleanups(hooks: Hook[] | undefined): void {
  hooks?.forEach((hook) => {
    if (hook.kind === "effect" && hook.cleanup) {
      hook.cleanup();
    }
  });
}

export function useState<T>(
  initial: T
): [T, (action: T | StateUpdater<T>) => void] {
  const previous = startHook("useState");
  const previousState = previous?.kind === "state" ? previous : undefined;

  const hook: StateHook = {
    kind: "state",
    state: previousState === undefined ? initial : previousState.state,
    queue: [],
  };

  (previousState?.queue ?? []).forEach((action) => {
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

  finishHook(hook);

  return [hook.state as T, setState];
}

export function useEffect(effect: EffectCallback, deps?: unknown[]): void {
  const previous = startHook("useEffect");
  const previousEffect = previous?.kind === "effect" ? previous : undefined;

  const hook: EffectHook = {
    kind: "effect",
    deps,
    cleanup: previousEffect?.cleanup,
  };

  if (!sameDeps(previousEffect?.deps, deps)) {
    if (previousEffect?.cleanup) {
      pendingCleanups.push(previousEffect.cleanup);
    }

    pendingEffects.push(() => {
      const cleanup = effect();

      hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
    });
  }

  finishHook(hook);
}

export function useMemo<T>(create: () => T, deps: unknown[]): T {
  const previous = startHook("useMemo");
  const previousMemo = previous?.kind === "memo" ? previous : undefined;

  const hook: MemoHook = {
    kind: "memo",
    value: sameDeps(previousMemo?.deps, deps) ? previousMemo?.value : create(),
    deps,
  };

  finishHook(hook);

  return hook.value as T;
}

export function useRef<T>(initial: T): { current: T } {
  return useMemo(() => ({ current: initial }), []);
}
