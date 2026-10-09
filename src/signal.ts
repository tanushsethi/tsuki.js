type SignalUpdater<T> = (previous: T) => T;

export type SignalRead<T> = () => T;

export type SignalWrite<T> = (next: T | SignalUpdater<T>) => void;

export type Signal<T> = [SignalRead<T>, SignalWrite<T>];

type Listener = {
  run: () => void;
  sources: Set<Set<Listener>>;
};

const listening: Listener[] = [];

function forget(listener: Listener): void {
  listener.sources.forEach((subscribers) => subscribers.delete(listener));
  listener.sources.clear();
}

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;

  const subscribers = new Set<Listener>();

  const read: SignalRead<T> = () => {
    const listener = listening[listening.length - 1];

    if (listener) {
      subscribers.add(listener);
      listener.sources.add(subscribers);
    }

    return value;
  };

  const write: SignalWrite<T> = (next) => {
    const resolved =
      typeof next === "function" ? (next as SignalUpdater<T>)(value) : next;

    if (resolved === value) {
      return;
    }

    value = resolved;

    Array.from(subscribers).forEach((listener) => listener.run());
  };

  return [read, write];
}

export function createEffect(effect: () => void): () => void {
  const listener: Listener = {
    run: () => {
      forget(listener);

      listening.push(listener);

      try {
        effect();
      } finally {
        listening.pop();
      }
    },
    sources: new Set(),
  };

  listener.run();

  return () => forget(listener);
}
