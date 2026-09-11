import { describe, expect, it } from "vitest";
import { createExplorerState, explorerReducer } from "./state";

describe("explorerReducer", () => {
  it("changes stage without changing the general tab", () => {
    const state = {
      ...createExplorerState("raw-materials"),
      generalTab: "facilities" as const,
    };
    const next = explorerReducer(state, {
      type: "set-stage",
      stageId: "modules",
      validFacilityIds: [],
      validCountryCodes: [],
    });
    expect(next).toMatchObject({
      activeStageId: "modules",
      generalTab: "facilities",
    });
  });

  it("keeps a facility selection only when it belongs to the new stage", () => {
    const selected = explorerReducer(createExplorerState("cells"), {
      type: "select-facility",
      id: "factory-one",
    });
    expect(
      explorerReducer(selected, {
        type: "set-stage",
        stageId: "modules",
        validFacilityIds: ["factory-one"],
        validCountryCodes: [],
      }).selection,
    ).toEqual({ kind: "facility", id: "factory-one" });
    expect(
      explorerReducer(selected, {
        type: "set-stage",
        stageId: "wafers",
        validFacilityIds: [],
        validCountryCodes: [],
      }).selection,
    ).toBeNull();
  });

  it("back restores the general panel state and its recorded list position", () => {
    const general = {
      ...createExplorerState("modules"),
      generalTab: "facilities" as const,
      facilityListScrollTop: 240,
    };
    const selected = explorerReducer(general, {
      type: "select-facility",
      id: "factory-one",
    });
    expect(explorerReducer(selected, { type: "back" })).toEqual(general);
  });
});
