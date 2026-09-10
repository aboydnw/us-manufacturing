import { expect, it } from "vitest";
import { observationFixture } from "../test/fixtures";
import { canCompare } from "./CapacityComparison";

it("refuses to compare tonnes of polysilicon directly with GWdc demand", () => {
  const polysilicon = observationFixture({ unit: "tonnes/year" });
  const modules = observationFixture({ unit: "GWdc/year" });
  expect(canCompare(polysilicon, modules)).toEqual({
    comparable: false,
    reason: "These values use different units and require a documented conversion.",
  });
});

it("allows observations with matching annual units", () => {
  const cells = observationFixture({ unit: "GWdc/year" });
  const modules = observationFixture({ unit: "GWdc/year" });
  expect(canCompare(cells, modules)).toEqual({ comparable: true });
});
