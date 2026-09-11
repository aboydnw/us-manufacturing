import { render, screen, within } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { App } from "./App";

afterEach(() => vi.unstubAllGlobals());

it("introduces the U.S. solar supply-chain question", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /how dependent is a u\.s\. solar installation/i,
    }),
  ).toBeInTheDocument();
});

it("keeps research and method controls out of the header", () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
  render(<App />);

  const header = screen.getByRole("banner");
  expect(header).not.toHaveTextContent(/open research/i);
  expect(
    within(header).queryByRole("button", { name: /^method$/i }),
  ).not.toBeInTheDocument();
});
