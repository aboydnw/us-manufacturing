import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import type { ResolvedSupplyMix } from "../data/schema";
import { questionFixture, sourceFixture } from "../test/fixtures";
import { SourceChart } from "./SourceChart";

const readyMix: ResolvedSupplyMix = {
  id: "module-supply-2025",
  stageId: "modules",
  product: "Crystalline-silicon modules",
  geography: "US market",
  period: "2025",
  measure: "actual-supply",
  unit: "GWdc",
  denominatorValue: 10,
  sourceId: sourceFixture.source_id,
  completeness: "complete",
  limitation: "Direct origin does not establish upstream origin.",
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

it("shows the explicit data request when a compatible series is absent", () => {
  render(
    <SourceChart
      mix={null}
      question={questionFixture()}
      onSelectCountry={() => undefined}
    />,
  );
  expect(
    screen.getByRole("heading", {
      name: /we need data for this. do you know of any/i,
    }),
  ).toBeVisible();
});

it("selects real country rows and labels denominator metadata", async () => {
  const user = userEvent.setup();
  const onSelectCountry = vi.fn();
  render(
    <SourceChart
      mix={readyMix}
      question={questionFixture()}
      onSelectCountry={onSelectCountry}
    />,
  );
  expect(screen.getByText(/10 GWdc · 2025 · direct origin/i)).toBeVisible();
  await user.click(screen.getByRole("button", { name: /china, 50%/i }));
  expect(onSelectCountry).toHaveBeenCalledWith("CHN");
  expect(screen.getByText(/unknown origin/i)).toBeVisible();
});

it("labels import shares as imports rather than total U.S. supply", () => {
  render(
    <SourceChart
      mix={{ ...readyMix, measure: "imports", unit: "USD" }}
      onSelectCountry={() => undefined}
    />,
  );
  expect(screen.getByText("Sources of U.S. imports")).toBeVisible();
  expect(screen.getByText(/shares of recorded import value/i)).toBeVisible();
  expect(screen.queryByText("Combined source")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /united states/i }),
  ).not.toBeInTheDocument();
});
