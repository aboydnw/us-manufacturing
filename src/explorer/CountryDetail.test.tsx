import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { ResolvedSupplyMix } from "../data/schema";
import { sourceFixture } from "../test/fixtures";
import { CountryDetail } from "./CountryDetail";

it("explains unavailable domestic evidence instead of reporting a failed lookup", () => {
  const mix: ResolvedSupplyMix = {
    id: "modules-2025",
    stageId: "modules",
    product: "Modules",
    geography: "US market",
    period: "2025",
    measure: "actual-supply",
    unit: "GWdc",
    denominatorValue: 100,
    sourceId: sourceFixture.source_id,
    completeness: "complete",
    limitation: "Fixture",
    countries: [
      {
        countryCode: "CHN",
        countryName: "China",
        value: 100,
        originType: "direct",
      },
    ],
    unknownOriginValue: null,
    source: sourceFixture,
  };
  render(<CountryDetail code="USA" mix={mix} />);
  expect(screen.getByRole("heading", { name: "United States" })).toBeVisible();
  expect(
    screen.getByText(/domestic supply value is not available/i),
  ).toBeVisible();
  expect(screen.queryByText(/not part of/i)).not.toBeInTheDocument();
});
