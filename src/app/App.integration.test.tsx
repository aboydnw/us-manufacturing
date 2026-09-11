import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import siteData from "../../public/data/site-data.json";
import { App } from "./App";

afterEach(() => vi.unstubAllGlobals());

it("renders the map explorer, stage navigation, panel tabs, and honest unknown state", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => siteData }),
  );
  render(<App />);

  expect(
    await screen.findByRole("navigation", {
      name: /solar manufacturing stages/i,
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("region", { name: /solar supply map/i }),
  ).toBeVisible();
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(
    screen.getByRole("heading", {
      name: /we need data for this. do you know of any/i,
    }),
  ).toBeVisible();
  expect(screen.getByText("Skip to the explorer")).toHaveAttribute(
    "href",
    "#explorer",
  );
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
});

it("moves from a stage to its facility list and selected detail", async () => {
  const user = userEvent.setup();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => siteData }),
  );
  render(<App />);

  await screen.findByRole("navigation", {
    name: /solar manufacturing stages/i,
  });
  await user.click(
    screen.getByRole("button", {
      name: /polysilicon, crystalline silicon/i,
    }),
  );
  await user.click(screen.getByRole("tab", { name: /u.s. facilities/i }));
  const facilityButtons = screen.getAllByRole("button", {
    name: /hemlo|dc alabama|wacker/i,
  });
  await user.click(facilityButtons[0]);
  expect(screen.getByRole("button", { name: /back/i })).toBeVisible();
  expect(
    screen.getByText(/^reported annual nameplate capacity$/i),
  ).toBeVisible();
});
