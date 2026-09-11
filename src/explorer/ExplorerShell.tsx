import { lazy, Suspense, useMemo, useReducer } from "react";
import type { SiteData } from "../data/schema";
import { InfoPanel } from "./InfoPanel";
import { MobilePanel } from "./MobilePanel";
import { StageNavigator } from "./StageNavigator";
import { createExplorerState, explorerReducer } from "./state";

const SupplyMap = lazy(() =>
  import("./SupplyMap").then((module) => ({ default: module.SupplyMap })),
);

export function ExplorerShell({ data }: { data: SiteData }) {
  const [state, dispatch] = useReducer(
    explorerReducer,
    data.stages[0]?.id ?? "raw-materials",
    createExplorerState,
  );
  const stage =
    data.stages.find((item) => item.id === state.activeStageId) ??
    data.stages[0];
  const facilities = useMemo(
    () =>
      data.facilities.filter(
        (facility) =>
          facility.stageId === state.activeStageId &&
          facility.status === "active",
      ),
    [data.facilities, state.activeStageId],
  );
  const observations = data.observations.filter(
    (observation) => observation.stageId === state.activeStageId,
  );
  const questions = data.questions.filter(
    (question) => question.stageId === state.activeStageId,
  );
  const supplyMix =
    data.supplyMixes.find(
      (mix) =>
        mix.stageId === state.activeStageId && mix.completeness === "complete",
    ) ?? null;
  const selectedFacilityId =
    state.selection?.kind === "facility" ? state.selection.id : null;
  const selectedCountryCode =
    state.selection?.kind === "country" ? state.selection.code : null;

  function selectStage(stageId: string) {
    const validFacilityIds = data.facilities
      .filter((facility) => facility.stageId === stageId)
      .map((facility) => facility.id);
    const validCountryCodes =
      data.supplyMixes
        .find(
          (mix) => mix.stageId === stageId && mix.completeness === "complete",
        )
        ?.countries.map((country) => country.countryCode) ?? [];
    dispatch({
      type: "set-stage",
      stageId,
      validFacilityIds,
      validCountryCodes,
    });
  }

  if (!stage) {
    return (
      <main className="app-status">No supply-chain stages are available.</main>
    );
  }

  const selection = state.selection;
  let selectionAnnouncement = `${stage.title} overview`;
  if (selection?.kind === "facility") {
    selectionAnnouncement = `Selected facility ${
      facilities.find((item) => item.id === selection.id)?.name ?? ""
    }`;
  } else if (selection?.kind === "country") {
    selectionAnnouncement = `Selected country ${
      supplyMix?.countries.find((item) => item.countryCode === selection.code)
        ?.countryName ?? ""
    }`;
  }

  return (
    <main id="explorer" className="explorer-shell">
      <div className="explorer-shell__navigator">
        <StageNavigator
          stages={data.stages}
          activeStageId={state.activeStageId}
          expanded={state.navigatorExpanded}
          onExpandedChange={(expanded) =>
            dispatch({ type: "set-navigator", expanded })
          }
          onSelect={selectStage}
        />
      </div>
      <div className="explorer-shell__map">
        <Suspense
          fallback={
            <section
              className="supply-map supply-map--loading"
              role="region"
              aria-label="Solar supply map"
            >
              Loading map…
            </section>
          }
        >
          <SupplyMap
            facilities={facilities}
            supplyMix={supplyMix}
            selectedCountryCode={selectedCountryCode}
            selectedFacilityId={selectedFacilityId}
            geographyView={state.geographyView}
            onGeographyChange={(view) =>
              dispatch({ type: "set-geography", view })
            }
            onSelectCountry={(code) =>
              dispatch({ type: "select-country", code })
            }
            onSelectFacility={(id) => dispatch({ type: "select-facility", id })}
          />
        </Suspense>
      </div>
      <MobilePanel>
        <InfoPanel
          stage={stage}
          facilities={facilities}
          observations={observations}
          questions={questions}
          supplyMix={supplyMix}
          selection={state.selection}
          generalTab={state.generalTab}
          facilityListScrollTop={state.facilityListScrollTop}
          onTabChange={(tab) => dispatch({ type: "set-tab", tab })}
          onBack={() => dispatch({ type: "back" })}
          onFacilitySelect={(id) => dispatch({ type: "select-facility", id })}
          onCountrySelect={(code) => dispatch({ type: "select-country", code })}
          onListScroll={(scrollTop) =>
            dispatch({ type: "set-list-scroll", scrollTop })
          }
        />
      </MobilePanel>
      <p className="sr-only" aria-live="polite">
        {selectionAnnouncement}
      </p>
    </main>
  );
}
