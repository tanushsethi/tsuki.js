import * as Tsuki from "../../src/index";

const element = (
  <div>
    <h1>tsuki.js</h1>
    <p>A small, from-scratch UI library with fine-grained signal reactivity.</p>
  </div>
);

Tsuki.render(element, document.querySelector<HTMLDivElement>("#root")!);
