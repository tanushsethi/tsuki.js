import type { TsukiElement } from "./types";

export { createElement } from "./createElement";
export { Fragment, render } from "./render";
export { useEffect, useMemo, useRef, useState } from "./hooks";
export { createEffect, createSignal } from "./signal";
export type { Signal, SignalRead, SignalWrite } from "./signal";
export type {
  TsukiChild,
  TsukiComponent,
  TsukiElement,
  TsukiTextSource,
} from "./types";

export namespace JSX {
  export type Element = TsukiElement;

  export interface IntrinsicElements {
    [name: string]: unknown;
  }
}
