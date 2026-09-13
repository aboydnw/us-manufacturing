import { describe, expect, it } from "vitest";
import { sourceFixture } from "../test/fixtures";
import type { ResolvedSupplyMix } from "../data/schema";
import { buildSupplyRanking } from "./supplyRanking";

function mix(
  countries: ResolvedSupplyMix["countries"],
  overrides: Partial<ResolvedSupplyMix> = {},
): ResolvedSupplyMix {
  return {
    id: "module-supply-2025",
    stageId: "modules",
    product: "Crystalline-silicon modules",
    geography: "US market",
    period: "2025",
    measure: "actual-supply",
    unit: "GWdc",
    denominatorValue: 100,
    sourceId: sourceFixture.source_id,
    completeness: "complete",
    limitation: "Test fixture",
    countries,
    unknownOriginValue: null,
    source: sourceFixture,
    ...overrides,
  };
}

const country = (code: string, name: string, value: number | null) => ({
  countryCode: code,
  countryName: name,
  value,
  originType: "direct" as const,
});

describe("buildSupplyRanking", () => {
  it("shows the top five countries and appends the United States as sixth", () => {
    const result = buildSupplyRanking(
      mix([
        country("CHN", "China", 30),
        country("VNM", "Vietnam", 20),
        country("THA", "Thailand", 15),
        country("MYS", "Malaysia", 10),
        country("KHM", "Cambodia", 8),
        country("USA", "United States", 5),
        country("CAN", "Canada", 4),
        country("MEX", "Mexico", 3),
      ]),
    );
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.rows.map((row) => row.label)).toEqual([
      "China",
      "Vietnam",
      "Thailand",
      "Malaysia",
      "Cambodia",
      "United States",
      "Rest of world",
    ]);
    expect(result.rows.at(-1)?.value).toBe(7);
  });

  it("does not duplicate the United States when it is already in the top five", () => {
    const result = buildSupplyRanking(
      mix([
        country("USA", "United States", 40),
        country("CHN", "China", 30),
        country("VNM", "Vietnam", 20),
      ]),
    );
    if (result.status !== "ready") throw new Error("Expected ready ranking");
    expect(
      result.rows.filter((row) => row.label === "United States"),
    ).toHaveLength(1);
  });

  it("renders a missing United States value as unknown rather than zero", () => {
    const result = buildSupplyRanking(
      mix([country("CHN", "China", 70), country("VNM", "Vietnam", 20)]),
    );
    if (result.status !== "ready") throw new Error("Expected ready ranking");
    expect(result.rows.find((row) => row.code === "USA")).toMatchObject({
      value: null,
      percentage: null,
    });
  });

  it("does not invent a domestic row for an imports-only denominator", () => {
    const result = buildSupplyRanking(
      mix([country("CHN", "China", 80), country("VNM", "Vietnam", 20)], {
        measure: "imports",
      }),
    );
    if (result.status !== "ready") throw new Error("Expected ready ranking");
    expect(result.rows.some((row) => row.code === "USA")).toBe(false);
  });

  it("keeps unknown origin separate from rest of world", () => {
    const result = buildSupplyRanking(
      mix([country("USA", "United States", 60), country("CHN", "China", 25)], {
        unknownOriginValue: 15,
      }),
    );
    if (result.status !== "ready") throw new Error("Expected ready ranking");
    expect(result.rows.find((row) => row.kind === "unknown")?.value).toBe(15);
    expect(result.rows.find((row) => row.kind === "rest")).toBeUndefined();
  });

  it("sorts equal values by country name for deterministic output", () => {
    const result = buildSupplyRanking(
      mix([
        country("USA", "United States", 10),
        country("MEX", "Mexico", 20),
        country("CAN", "Canada", 20),
      ]),
    );
    if (result.status !== "ready") throw new Error("Expected ready ranking");
    expect(result.rows.slice(0, 2).map((row) => row.label)).toEqual([
      "Canada",
      "Mexico",
    ]);
  });

  it("withholds rankings for absent or incomplete series", () => {
    expect(buildSupplyRanking(null).status).toBe("unknown");
    expect(
      buildSupplyRanking(mix([], { completeness: "partial" })).status,
    ).toBe("unknown");
  });
});
