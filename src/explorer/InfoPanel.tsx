import type {
  Question,
  ResolvedFacility,
  ResolvedObservation,
  ResolvedSupplyMix,
  Stage,
} from "../data/schema";
import type { ExplorerSelection } from "./state";
import { CountryDetail } from "./CountryDetail";
import { FacilityDetail } from "./FacilityDetail";
import { FacilityList } from "./FacilityList";
import { StageOverview } from "./StageOverview";

interface Props {
  stage: Stage;
  facilities: ResolvedFacility[];
  observations: ResolvedObservation[];
  questions: Question[];
  supplyMix: ResolvedSupplyMix | null;
  selection: ExplorerSelection;
  generalTab: "overview" | "facilities";
  facilityListScrollTop: number;
  onTabChange: (tab: "overview" | "facilities") => void;
  onBack: () => void;
  onFacilitySelect: (id: string) => void;
  onCountrySelect: (code: string) => void;
  onListScroll: (scrollTop: number) => void;
}

export function InfoPanel({
  stage,
  facilities,
  observations,
  questions,
  supplyMix,
  selection,
  generalTab,
  facilityListScrollTop,
  onTabChange,
  onBack,
  onFacilitySelect,
  onCountrySelect,
  onListScroll,
}: Props) {
  if (selection) {
    const facility =
      selection.kind === "facility"
        ? facilities.find((item) => item.id === selection.id)
        : null;
    return (
      <aside
        className="info-panel info-panel--detail"
        aria-label="Selection details"
      >
        <button type="button" className="info-panel__back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back
        </button>
        {facility ? <FacilityDetail facility={facility} /> : null}
        {selection.kind === "country" && supplyMix ? (
          <CountryDetail code={selection.code} mix={supplyMix} />
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="info-panel" aria-label="Stage information">
      <div
        className="info-panel__tabs"
        role="tablist"
        aria-label="Stage information"
      >
        <button
          type="button"
          role="tab"
          aria-selected={generalTab === "overview"}
          onClick={() => onTabChange("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={generalTab === "facilities"}
          onClick={() => onTabChange("facilities")}
        >
          U.S. facilities <span>{facilities.length}</span>
        </button>
      </div>
      <div className="info-panel__content">
        {generalTab === "overview" ? (
          <StageOverview
            stage={stage}
            observations={observations}
            questions={questions}
            supplyMix={supplyMix}
            onCountrySelect={onCountrySelect}
          />
        ) : (
          <FacilityList
            facilities={facilities}
            initialScrollTop={facilityListScrollTop}
            onScroll={onListScroll}
            onSelect={onFacilitySelect}
          />
        )}
      </div>
    </aside>
  );
}
