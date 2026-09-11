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

it("keeps the map focused on the U.S. without geography controls", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(
    <SupplyMap
      facilities={[]}
      supplyMix={null}
      selectedCountryCode={null}
      selectedFacilityId={null}
      onSelectCountry={() => undefined}
      onSelectFacility={() => undefined}
    />,
  );
  expect(screen.queryByRole("group", { name: /map geography/i })).toBeNull();
});

it("centers missing facility and import-origin context over the map", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(
    <SupplyMap
      facilities={[]}
      supplyMix={null}
      selectedCountryCode={null}
      selectedFacilityId={null}
      onSelectCountry={() => undefined}
      onSelectFacility={() => undefined}
    />,
  );

  const status = screen.getByRole("status", { name: /map data availability/i });
  expect(status).toHaveTextContent(/no mapped U\.S\. facilities/i);
  expect(status).toHaveTextContent(/country-of-origin import data/i);
});
