import type { TsukiComponent, TsukiElement } from "./types";

export type EffectTag = "PLACEMENT" | "UPDATE" | "DELETION";

export type Hook = {
  state: unknown;
  queue: unknown[];
};

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
