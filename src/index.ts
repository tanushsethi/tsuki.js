import type { TsukiElement } from "./types";

export { createElement } from "./createElement";
export type { TsukiChild, TsukiElement } from "./types";

export namespace JSX {
  export type Element = TsukiElement;

  export interface IntrinsicElements {
    [name: string]: Record<string, unknown>;
  }
}
