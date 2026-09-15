import * as Tsuki from "../../src/index";

const element = (
  <div id="app">
    <h1>tsuki.js</h1>
    <p>A small, from-scratch UI library with fine-grained signal reactivity.</p>
  </div>
);

document.querySelector<HTMLDivElement>("#root")!.textContent = JSON.stringify(
  element,
  null,
  2
);
