import * as Tsuki from "../../src/index";

const ROW_COUNT = 10000;

const rows = Tsuki.createElement(
  "div",
  { id: "rows" },
  ...Array.from({ length: ROW_COUNT }, (_, index) =>
    Tsuki.createElement("div", null, `row ${index + 1}`)
  )
);

function Moons(): Tsuki.JSX.Element {
  const [count, setCount] = Tsuki.useState(0);

  return (
    <p id="moons">
      <button onClick={() => setCount((previous) => previous + 1)}>
        count a moon
      </button>
      {" "}
      {count} counted
    </p>
  );
}

function Masthead(props: { tagline: string }): Tsuki.JSX.Element {
  return (
    <>
      <h1>tsuki.js</h1>
      <p>{props.tagline}</p>
      <button onClick={() => document.body.classList.toggle("night")}>
        toggle the night sky
      </button>
      <Moons />
    </>
  );
}

const element = (
  <div id="app">
    <Masthead tagline="A small, from-scratch UI library with fine-grained signal reactivity." />
    {rows}
  </div>
);

const frames = document.querySelector<HTMLParagraphElement>("#frames")!;
const started = performance.now();
let painted = 0;

function countFrame(): void {
  painted += 1;

  const rendered = document.querySelectorAll("#rows > div").length;
  const elapsed = Math.round(performance.now() - started);

  frames.textContent = `${rendered} of ${ROW_COUNT} rows, ${painted} frames painted in ${elapsed}ms`;

  if (rendered < ROW_COUNT) {
    requestAnimationFrame(countFrame);
  }
}

requestAnimationFrame(countFrame);

Tsuki.render(element, document.querySelector<HTMLDivElement>("#root")!);
