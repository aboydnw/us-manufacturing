export type ExplorerSelection =
  { kind: "facility"; id: string } | { kind: "country"; code: string } | null;

export interface ExplorerState {
  activeStageId: string;
  geographyView: "us" | "global";
  generalTab: "overview" | "facilities";
  selection: ExplorerSelection;
  navigatorExpanded: boolean;
  facilityListScrollTop: number;
}

export type ExplorerAction =
  | {
      type: "set-stage";
      stageId: string;
      validFacilityIds: string[];
      validCountryCodes: string[];
    }
  | { type: "set-geography"; view: ExplorerState["geographyView"] }
  | { type: "set-tab"; tab: ExplorerState["generalTab"] }
  | { type: "select-facility"; id: string }
  | { type: "select-country"; code: string }
  | { type: "set-navigator"; expanded: boolean }
  | { type: "set-list-scroll"; scrollTop: number }
  | { type: "back" };

export function createExplorerState(activeStageId: string): ExplorerState {
  return {
    activeStageId,
    geographyView: "us",
    generalTab: "overview",
    selection: null,
    navigatorExpanded: false,
    facilityListScrollTop: 0,
  };
}

export function explorerReducer(
  state: ExplorerState,
  action: ExplorerAction,
): ExplorerState {
  switch (action.type) {
    case "set-stage": {
      const selection =
        state.selection?.kind === "facility"
          ? action.validFacilityIds.includes(state.selection.id)
            ? state.selection
            : null
          : state.selection?.kind === "country"
            ? action.validCountryCodes.includes(state.selection.code)
              ? state.selection
              : null
            : null;
      return { ...state, activeStageId: action.stageId, selection };
    }
    case "set-geography":
      return { ...state, geographyView: action.view };
    case "set-tab":
      return { ...state, generalTab: action.tab, selection: null };
    case "select-facility":
      return { ...state, selection: { kind: "facility", id: action.id } };
    case "select-country":
      return { ...state, selection: { kind: "country", code: action.code } };
    case "set-navigator":
      return { ...state, navigatorExpanded: action.expanded };
    case "set-list-scroll":
      return { ...state, facilityListScrollTop: action.scrollTop };
    case "back":
      return { ...state, selection: null };
  }
}
