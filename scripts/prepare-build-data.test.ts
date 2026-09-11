import { expect, it } from "vitest";
import { censusImportYearForBuild } from "./prepare-build-data";

it("skips the Census refresh when the build secret is unavailable", () => {
  expect(
    censusImportYearForBuild({}, new Date("2026-09-11T00:00:00Z")),
  ).toBeNull();
});

it("refreshes the latest completed calendar year when the build secret exists", () => {
  expect(
    censusImportYearForBuild(
      { CENSUS_API_KEY: "configured" },
      new Date("2026-09-11T00:00:00Z"),
    ),
  ).toBe("2025");
});

it("allows a Cloudflare build to pin an explicit import year", () => {
  expect(
    censusImportYearForBuild(
      { CENSUS_API_KEY: "configured", CENSUS_IMPORT_YEAR: "2024" },
      new Date("2026-09-11T00:00:00Z"),
    ),
  ).toBe("2024");
});

it("rejects an invalid explicit import year", () => {
  expect(() =>
    censusImportYearForBuild(
      { CENSUS_API_KEY: "configured", CENSUS_IMPORT_YEAR: "latest" },
      new Date("2026-09-11T00:00:00Z"),
    ),
  ).toThrow(/CENSUS_IMPORT_YEAR must use YYYY format/);
});
