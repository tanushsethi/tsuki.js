import type { TsukiComponent, TsukiElement } from "./types";

export type EffectTag = "PLACEMENT" | "UPDATE" | "DELETION";

export type StateHook = {
  kind: "state";
  state: unknown;
  queue: unknown[];
};

export type EffectHook = {
  kind: "effect";
  deps?: unknown[];
  cleanup?: () => void;
};

export type MemoHook = {
  kind: "memo";
  value: unknown;
  deps: unknown[];
};

export type Hook = StateHook | EffectHook | MemoHook;

export type Fiber = {
  type?: string | TsukiComponent;
  dom?: Node;
  props: TsukiElement["props"];
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber;
  effectTag?: EffectTag;
  hooks?: Hook[];
};
