import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { ResolvedSupplyMix } from "../data/schema";
import {
  facilityFixture,
  observationFixture,
  questionFixture,
  sourceFixture,
  stageFixture,
} from "../test/fixtures";
import { FacilityList } from "./FacilityList";
import { InfoPanel } from "./InfoPanel";

const supplyMix: ResolvedSupplyMix = {
  id: "wafer-supply-2025",
  stageId: "wafers",
  product: "Wafers",
  geography: "US market",
  period: "2025",
  measure: "actual-supply",
  unit: "GWdc",
  denominatorValue: 10,
  sourceId: sourceFixture.source_id,
  completeness: "complete",
  limitation: "Direct origin does not reveal upstream origin.",
  countries: [
    {
      countryCode: "USA",
      countryName: "United States",
      value: 4,
      originType: "direct",
    },
    {
      countryCode: "CHN",
      countryName: "China",
      value: 5,
      originType: "direct",
    },
  ],
  unknownOriginValue: 1,
  source: sourceFixture,
};

const baseProps = {
  stage: stageFixture(),
  facilities: [facilityFixture()],
  observations: [observationFixture()],
  questions: [questionFixture()],
  supplyMix,
  generalTab: "overview" as const,
  facilityListScrollTop: 0,
  onTabChange: vi.fn(),
  onBack: vi.fn(),
  onFacilitySelect: vi.fn(),
  onCountrySelect: vi.fn(),
  onListScroll: vi.fn(),
};

it("opens on the stage overview without a back control", () => {
  render(<InfoPanel {...baseProps} selection={null} />);
  expect(
    screen.getByRole("heading", { name: /ingots and wafers/i }),
  ).toBeVisible();
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
});

it("switches to the U.S. facilities tab", async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();
  render(
    <InfoPanel {...baseProps} selection={null} onTabChange={onTabChange} />,
  );
  await user.click(screen.getByRole("tab", { name: /u.s. facilities/i }));
  expect(onTabChange).toHaveBeenCalledWith("facilities");
});

it("replaces general content with facility detail and a sourced capacity caveat", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  render(
    <InfoPanel
      {...baseProps}
      selection={{ kind: "facility", id: "factory-one" }}
      onBack={onBack}
    />,
  );
  expect(screen.getByRole("heading", { name: "Factory One" })).toBeVisible();
  expect(screen.getByText(/reported annual nameplate capacity/i)).toBeVisible();
  expect(screen.getByText(/not observed production/i)).toBeVisible();
  await user.click(screen.getByRole("button", { name: /back/i }));
  expect(onBack).toHaveBeenCalledOnce();
});

it("replaces general content with individual-country detail", () => {
  render(
    <InfoPanel {...baseProps} selection={{ kind: "country", code: "CHN" }} />,
  );
  expect(screen.getByRole("heading", { name: "China" })).toBeVisible();
  expect(screen.getByText("50%")).toBeVisible();
  expect(screen.getByText(/^direct origin$/i)).toBeVisible();
});

it("restores and records the facility list scroll position", () => {
  const onScroll = vi.fn();
  render(
    <FacilityList
      facilities={[facilityFixture()]}
      initialScrollTop={240}
      onScroll={onScroll}
      onSelect={() => undefined}
    />,
  );
  const list = screen.getByRole("list", { name: /u.s. facilities/i });
  expect(list.scrollTop).toBe(240);
  Object.defineProperty(list, "scrollTop", { value: 360, configurable: true });
  fireEvent.scroll(list);
  expect(onScroll).toHaveBeenCalledWith(360);
});
