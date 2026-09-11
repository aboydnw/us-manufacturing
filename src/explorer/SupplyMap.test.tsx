import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { facilityFixture } from "../test/fixtures";
import { SupplyMap } from "./SupplyMap";

it("keeps facilities selectable when WebGL is unavailable", async () => {
  const user = userEvent.setup();
  const onSelectFacility = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

  render(
    <SupplyMap
      facilities={[facilityFixture()]}
      supplyMix={null}
      selectedCountryCode={null}
      selectedFacilityId={null}
      geographyView="us"
      onGeographyChange={() => undefined}
      onSelectCountry={() => undefined}
      onSelectFacility={onSelectFacility}
    />,
  );

  expect(screen.getByRole("region", { name: /supply map/i })).toBeVisible();
  expect(screen.getByText(/interactive map unavailable/i)).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: /factory one.*2.5 GWdc\/year/i }),
  );
  expect(onSelectFacility).toHaveBeenCalledWith("factory-one");
});

it("changes geography using labeled map controls", async () => {
  const user = userEvent.setup();
  const onGeographyChange = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(
    <SupplyMap
      facilities={[]}
      supplyMix={null}
      selectedCountryCode={null}
      selectedFacilityId={null}
      geographyView="us"
      onGeographyChange={onGeographyChange}
      onSelectCountry={() => undefined}
      onSelectFacility={() => undefined}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Global" }));
  expect(onGeographyChange).toHaveBeenCalledWith("global");
});
