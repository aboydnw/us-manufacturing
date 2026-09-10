import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import siteData from "../../public/data/site-data.json";
import { App } from "./App";

afterEach(() => vi.unstubAllGlobals());

it("renders the reference system, all stages, synthesis, unknowns, and sources", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => siteData }),
  );
  render(<App />);
  expect(await screen.findByText("100 MWdc reference installation")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Raw materials" })).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Installed U.S. project" }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "What we still do not know" }),
  ).toBeVisible();
  expect(screen.getByRole("heading", { name: "Method and sources" })).toBeVisible();
});
