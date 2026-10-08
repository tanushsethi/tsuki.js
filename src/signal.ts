type SignalUpdater<T> = (previous: T) => T;

export type SignalRead<T> = () => T;

export type SignalWrite<T> = (next: T | SignalUpdater<T>) => void;

export type Signal<T> = [SignalRead<T>, SignalWrite<T>];

const listenersOf = new WeakMap<object, Set<() => void>>();

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;

  const listeners = new Set<() => void>();

  const read: SignalRead<T> = () => value;

  const write: SignalWrite<T> = (next) => {
    const resolved =
      typeof next === "function" ? (next as SignalUpdater<T>)(value) : next;

    if (resolved === value) {
      return;
    }

    value = resolved;

    Array.from(listeners).forEach((listener) => listener());
  };

  listenersOf.set(read, listeners);

  return [read, write];
}

export function createEffect(
  effect: () => void,
  sources: ReadonlyArray<SignalRead<unknown>>
): () => void {
  const subscriptions = sources.map((source) => {
    const listeners = listenersOf.get(source);

    if (listeners === undefined) {
      throw new Error("createEffect only subscribes to signal readers");
    }

    return listeners;
  });

  effect();

  subscriptions.forEach((listeners) => listeners.add(effect));

  return () => {
    subscriptions.forEach((listeners) => listeners.delete(effect));
  };
}
