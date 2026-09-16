import * as Tsuki from "../../src/index";

const element = (
  <div id="app">
    <h1>tsuki.js</h1>
    <p>A small, from-scratch UI library with fine-grained signal reactivity.</p>
    <button onClick={() => document.body.classList.toggle("night")}>
      toggle the night sky
    </button>
  </div>
);

Tsuki.render(element, document.querySelector<HTMLDivElement>("#root")!);
