import type { TsukiElement } from "./types";

export { createElement } from "./createElement";
export { Fragment, render } from "./render";
export type { TsukiChild, TsukiComponent, TsukiElement } from "./types";

export namespace JSX {
  export type Element = TsukiElement;

  export interface IntrinsicElements {
    [name: string]: unknown;
  }
}
