import type { TsukiElement } from "./types";

export type EffectTag = "PLACEMENT" | "UPDATE";

export type Fiber = {
  type?: string;
  dom?: Node;
  props: TsukiElement["props"];
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber;
  effectTag?: EffectTag;
};
