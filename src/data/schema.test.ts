import { expect, it } from "vitest";
import { ObservationSchema } from "./schema";

it("rejects a negative capacity observation", () => {
  expect(() =>
    ObservationSchema.parse({
      id: "bad-capacity",
      stageId: "modules",
      sourceId: "source",
      metric: "module-nameplate",
      value: -1,
      displayValue: "-1 GWdc/year",
      unit: "GWdc/year",
      geography: "United States",
      period: "2026",
      evidenceType: "nameplate",
      definition: "Rated capacity",
      limitation: "Not production",
      calculation: null,
    }),
  ).toThrow();
});
