import * as Tsuki from "../../src/index";

const ROW_COUNT = 10000;

const PHASES = ["new", "waxing", "full", "waning"];

const NOTES = ["clear skies", "thin clouds", "a bright halo"];

const [phase, turnMoon] = Tsuki.createSignal(0);

const [note, nextNote] = Tsuki.createSignal(0);

const [noteShown, showNote] = Tsuki.createSignal(false);

const [moons, countMoon] = Tsuki.createSignal(0);

const rows = Tsuki.createElement(
  "div",
  { id: "rows" },
  ...Array.from({ length: ROW_COUNT }, (_, index) =>
    Tsuki.createElement("div", null, `row ${index + 1}`)
  )
);

function StateCount(): Tsuki.JSX.Element {
  const [count, setCount] = Tsuki.useState(0);

  Tsuki.useEffect(() => {
    document.title = count === 0 ? "tsuki.js" : `tsuki.js — ${count} moons`;
  }, [count]);

  return (
    <p id="state-count" className={`count flash-${count % 2}`}>
      <button onClick={() => setCount((previous) => previous + 1)}>
        count a moon
      </button>
      {" "}
      {count} counted by state
    </p>
  );
}

function SignalCount(): Tsuki.JSX.Element {
  return (
    <p id="signal-count" className={() => `count flash-${moons() % 2}`}>
      <button onClick={() => countMoon((previous) => previous + 1)}>
        count a moon
      </button>
      {" "}
      {() => `${moons()} counted by a signal`}
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
      <StateCount />
      <SignalCount />
      <button
        onClick={() => turnMoon((previous) => (previous + 1) % PHASES.length)}
      >
        turn the moon
      </button>
      <button
        onClick={() => nextNote((previous) => (previous + 1) % NOTES.length)}
      >
        change the note
      </button>
      <button onClick={() => showNote((previous) => !previous)}>
        show the note
      </button>
      <p id="phase">
        {() =>
          noteShown()
            ? `${PHASES[phase()]} moon, ${NOTES[note()]}`
            : `${PHASES[phase()]} moon`
        }
      </p>
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
