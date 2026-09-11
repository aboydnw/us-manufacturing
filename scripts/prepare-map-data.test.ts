import { expect, it } from "vitest";
import { normalizeDoeFacilities } from "./prepare-map-data";

it("normalizes comparable module capacity to GWdc per year", () => {
  const facilities = normalizeDoeFacilities([
    {
      title: "Example Solar",
      sector: "Modules",
      subsector: "c-Si",
      url: "https://example.com",
      latitude: "33.4",
      longitude: "-111.8",
      facility_type: "Manufacturing",
      large: "TRUE",
      name: "Example Solar",
      capacity: "2500 MWdc/yr",
      state: "Arizona",
      city: "Mesa",
      manufacturing: "TRUE",
    },
  ]);

  expect(facilities).toMatchObject([
    {
      stageId: "modules",
      technology: "c-si",
      measureType: "nameplate-capacity",
      measureValue: 2.5,
      measureUnit: "GWdc/year",
    },
  ]);
});

it("keeps mixed product capacities unsized instead of comparing them", () => {
  const facilities = normalizeDoeFacilities([
    {
      title: "Example Glass",
      sector: "Components",
      subsector: "solar glass",
      url: "https://example.com",
      latitude: "40",
      longitude: "-80",
      facility_type: "Manufacturing",
      large: "FALSE",
      name: "Example Glass",
      capacity: "500 kt/yr",
      state: "Pennsylvania",
      city: "Pittsburgh",
      manufacturing: "TRUE",
    },
  ]);

  expect(facilities[0]).toMatchObject({
    stageId: "modules",
    measureValue: null,
    measureUnit: "",
  });
});

it("excludes nonmanufacturing and out-of-scope tool records", () => {
  const base = {
    title: "Example",
    sector: "Tools",
    subsector: "production tools",
    url: "https://example.com",
    latitude: "40",
    longitude: "-80",
    facility_type: "Headquarters",
    large: "FALSE",
    name: "Example",
    capacity: "0 MWdc/yr",
    state: "Ohio",
    city: "Cleveland",
    manufacturing: "TRUE",
  };

  expect(
    normalizeDoeFacilities([
      base,
      { ...base, sector: "Modules", manufacturing: "FALSE" },
    ]),
  ).toEqual([]);
});
