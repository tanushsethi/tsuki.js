import { describe, expect, it } from "vitest";

import { createElement } from "./createElement";

describe("createElement", () => {
  it("builds an element from a type", () => {
    expect(createElement("div")).toEqual({
      type: "div",
      props: { children: [] },
    });
  });

  it("keeps props alongside children", () => {
    const element = createElement("a", { href: "https://example.com" });

    expect(element.props.href).toBe("https://example.com");
    expect(element.props.children).toEqual([]);
  });

  it("treats a missing props argument as no props", () => {
    expect(createElement("div", null).props).toEqual({ children: [] });
  });

  it("wraps a string child in a text element", () => {
    const element = createElement("h1", null, "tsuki");

    expect(element.props.children).toEqual([
      { type: "TEXT_ELEMENT", props: { nodeValue: "tsuki", children: [] } },
    ]);
  });

  it("wraps a number child without turning it into a string", () => {
    const [child] = createElement("span", null, 42).props.children;

    expect(child.type).toBe("TEXT_ELEMENT");
    expect(child.props.nodeValue).toBe(42);
  });

  it("passes element children through untouched", () => {
    const child = createElement("span");
    const parent = createElement("div", null, child);

    expect(parent.props.children[0]).toBe(child);
  });

  it("keeps several children in order", () => {
    const element = createElement("p", null, "one", createElement("br"), "two");

    expect(element.props.children.map((child) => child.type)).toEqual([
      "TEXT_ELEMENT",
      "br",
      "TEXT_ELEMENT",
    ]);
  });

  it("nests to any depth", () => {
    const tree = createElement(
      "div",
      null,
      createElement("ul", null, createElement("li", null, "moon"))
    );

    const item = tree.props.children[0].props.children[0];

    expect(item.type).toBe("li");
    expect(item.props.children[0].props.nodeValue).toBe("moon");
  });

  it("lets real children win over a children prop", () => {
    const element = createElement("div", { children: "ignored" }, "kept");

    expect(element.props.children).toEqual([
      { type: "TEXT_ELEMENT", props: { nodeValue: "kept", children: [] } },
    ]);
  });

  it("does not share the props object with its caller", () => {
    const props = { id: "root" };
    const element = createElement("div", props);

    expect(element.props).not.toBe(props);
    expect(props).toEqual({ id: "root" });
  });
});
