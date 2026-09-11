# Solar Supply Chain Map Explorer — V1 Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan inline, task by task. Follow the tests-first order within each task and keep the checklist current.

**Goal:** Replace the current long-form supply-chain article with a desktop-first, responsive map explorer that lets a reader move through each solar-manufacturing stage, inspect verified U.S. facilities, understand what is and is not known about foreign sourcing, and contribute missing data without ever turning capacity into a false domestic-supply claim.

**Architecture:** Keep the existing React/Vite static site, repository-owned data, Zod validation, source registry, and Vercel deployment. Add a locally rendered MapLibre map using checked-in public-domain boundaries, compile DOE facility records into the existing public data artifact, and centralize explorer state in a small reducer. Country flows and the source chart are rendered only from a denominator-compatible supply series; until such a series exists for a stage, the interface shows a first-class data-needed state.

**Tech Stack:** React 19, TypeScript 6, Vite 8, MapLibre GL JS, Zod 4, CSV/JSON source files, Vitest and Testing Library, Playwright for viewport and screenshot checks, authored CSS, static Vercel hosting.

---

## 1. Assessment of the existing project

The current application has a sound evidence foundation but the wrong interaction model for the new direction.

### Preserve

- `data/source-registry.csv` as the inventory of provenance and reuse terms.
- `data/stages.json` as the canonical stage taxonomy, including the crystalline-silicon and CdTe branches.
- `data/observations.csv`, `data/questions.json`, and `data/reference-system.json` as reviewed source inputs.
- `scripts/compile-data.ts` as the boundary between source material and browser-ready data.
- `src/data/schema.ts` as the runtime contract for everything the UI is allowed to claim.
- Existing evidence distinctions: observed, nameplate, modeled, announced, and unknown.
- Existing source detail and “We need data for this” patterns, adapted to the panel.
- A fully static build with no accounts, database, API, or server runtime.

### Replace

- The long scrolling composition in `src/app/App.tsx` with a full-viewport explorer shell.
- The warm editorial chapter layout in `src/styles.css` with a lighter geographic workspace: shallow header, compact stage strip, dominant map, and one right-hand information panel.
- Stage anchors and chapter scrolling with direct stage selection.
- The full-page facility/source presentations with progressive disclosure inside the side panel.

### Current evidence constraint

The repository does not currently contain a stage-level series in which individual countries, the United States, unknown origin, and the total all share the same product, unit, period, and denominator. Consequently:

- the redesign must not copy the illustrative percentages, factories, or routes in `solar_redesign_wireframe.png`;
- no international flow is drawn until a compatible country-supply record exists;
- no country ranking is shown from unrelated global-production shares or direct-import values;
- stages without compatible sourcing data show “We need data for this. Do you know of any?” in both the chart area and the country layer explanation;
- verified DOE factory capacity may be mapped and compared within a stage, but never labeled as domestic supply share or actual production.

---

## 2. Product behavior

### Default desktop view

- The app fills the viewport.
- A shallow header states the project question and provides Method/Sources access.
- Directly below it, a compact stage navigator shows the real process taxonomy.
- The map occupies the remaining left/center area and initially frames the contiguous United States with Canada and Mexico visible.
- A 360–420 px panel on the right scrolls independently of the map.
- The initial panel has no back arrow and opens on the stage Overview tab.
- U.S. / Global controls change geography without changing the active stage.

### Stage navigator

- The collapsed strip exposes stage icons, the current stage name, branch context, and a Next control.
- Hover, focus-within, activation, and touch can expand the full navigator over the map without changing map dimensions.
- Arrow keys move between stages; Enter/Space selects; Escape collapses.
- Selecting a stage preserves map camera and the current Overview/Facilities tab, but clears a selected facility or country that is not valid for the new stage.
- Branches are visually explicit: shared inputs may lead to crystalline-silicon or CdTe and then rejoin at installation where the taxonomy says they do.

### Map

- U.S. facilities are selectable circles.
- Circle **area**, not radius, represents a comparable positive facility measure. The legend says the exact metric, unit, period, and evidence type.
- Facilities without a valid comparable value remain selectable but use a fixed “value unavailable” symbol and are excluded from size rankings.
- Nonoperating, announced, and proposed facilities are excluded by default and surfaced as a separate status only if the source supports it.
- Selecting a facility updates the panel without changing the camera.
- Selecting a country from the chart highlights its polygon and shows a sourcing flow only when a compatible quantity exists.
- Visible countries use a country highlight plus curved flow. Offscreen countries use a boundary-crossing flow and label on the geographically correct side of the viewport.
- Aggregate labels such as “Rest of world” and “Rest of Asia” never receive coordinates, polygons, or flows.
- The United States never receives a U.S.-to-U.S. import flow.
- Country and facility meaning is available through text, shape/stroke, and accessible labels, not color alone.

### Combined source chart

For a complete, compatible country-supply series:

1. Rank the five largest individual countries.
2. Always include the United States; append it as a sixth country when it falls outside the top five.
3. Sum all remaining known individual countries into “Rest of world.”
4. Show unknown/unallocated origin separately and do not include it in “Rest of world.”
5. Display the common denominator, product, unit, period, evidence type, and source beside the chart.

If the U.S. value is missing, render it as unknown—not zero. If the series is incomplete or mixes definitions, suppress the ranking and render a data-needed state.

### Right panel state model

The UI has one panel, not floating map cards plus a table.

- **General / Overview:** stage explanation, evidence summary, compatible source chart or unknown state, and caveats.
- **General / U.S. facilities:** searchable/scrollable facility list for the active stage, with status and measure labels.
- **Facility selected:** replaces the general content with facility detail, source, measure definition, period, status, and caveat; Back restores the previous general tab and exact list scroll position.
- **Country selected:** replaces the general content with the country contribution, common denominator, source, and upstream/direct-origin distinction; Back restores the previous general state.
- Map camera, stage, and geography mode remain stable through panel Back.

### Mobile

- The same map and selection state remain authoritative.
- The right panel becomes a bottom sheet with collapsed, half, and expanded positions.
- The stage strip remains horizontally reachable and keyboard operable.
- No essential detail relies on hover.

---

## 3. Data design and source choices

### New checked-in source inputs

#### `data/facilities.csv`

Normalize the public DOE Solar Manufacturing Map CSV already recorded in the source registry. Include only fields needed by the product:

```text
id,source_id,name,company,stage_id,technology,facility_type,city,state,country_code,latitude,longitude,status,measure_type,measure_value,measure_unit,measure_period,source_url,limitation
```

Rules:

- Use stable IDs derived from source identity, not array position.
- Keep the DOE name and location verbatim except for whitespace normalization.
- Map DOE subsectors/facility types to existing stage IDs through a reviewed lookup table.
- Default-map only active operating manufacturing records.
- Treat `capacity` as nameplate capacity. Never relabel it production or domestic supply.
- Parse a value only when its unit is explicit and matches the stage comparison; preserve ambiguous values as `null` with a limitation.
- Do not combine GW/year, tonnes/year, or component counts.
- Keep the raw-download URL and retrieval date in provenance documentation.

#### `data/supply-mixes.json`

This is the only input allowed to create country rankings or international flows.

```ts
type SupplyMix = {
  id: string;
  stageId: string;
  product: string;
  geography: "US market";
  period: string;
  measure: "actual-supply" | "imports";
  unit: string;
  denominatorValue: number;
  sourceId: string;
  completeness: "complete" | "partial";
  limitation: string;
  countries: Array<{
    countryCode: string;
    countryName: string;
    value: number | null;
    originType: "direct" | "upstream";
  }>;
  unknownOriginValue: number | null;
};
```

Ship this file as an empty array until a permissively reusable compatible series is verified. Empty is a valid, intentional state.

#### Map boundaries

- `public/data/countries.geojson`: Natural Earth Admin 0 Countries, 1:50m, version pinned in the source registry. Natural Earth states that its vector data are public domain.
- `public/data/us-states.geojson`: the current U.S. Census 1:20,000,000 national state cartographic boundary file, converted and simplified only as needed for display. Census cartographic boundaries are designed for small-scale thematic maps and are not used for geographic measurement.
- Keep only display fields: stable code, name, and geometry.
- Document disputed-boundary conventions inherited from Natural Earth and display a concise attribution.
- The initial map uses local vector data and a local style, avoiding an external tile service and its runtime availability/privacy/licensing concerns.

Official references:

- Natural Earth countries: <https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/>
- Natural Earth public-domain terms: <https://www.naturalearthdata.com/about/terms-of-use/>
- Census cartographic boundaries: <https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html>

### Schema/compiler changes

Extend `src/data/schema.ts` and `scripts/compile-data.ts` with facilities and supply mixes. The compiler must reject:

- unknown source, stage, or country codes;
- duplicate IDs;
- invalid coordinates;
- negative values;
- missing units on numeric measures;
- a `supply-mix` country named like an aggregate region;
- mixed direct and upstream origin types inside one series;
- denominator/unit/product/period mismatches;
- country totals greater than the denominator, allowing a small documented rounding tolerance;
- `unknownOriginValue` included in known-country totals;
- a facility capacity described as production;
- any generated U.S.-to-U.S. flow.

Compile resolved source objects into `public/data/site-data.json`, preserving the current deterministic `generatedAt` rule.

### Data language

- “Capacity” means stated annual nameplate capacity.
- “Production/output” is reserved for observed production.
- “Direct origin” is the country recorded for U.S. supply/imports and does not imply upstream material origin.
- “Global upstream concentration” is a separate view and never silently substituted for direct U.S. sourcing.
- “Unknown” is evidence status, not a numeric zero.

---

## 4. Frontend architecture

### Explorer state

Create `src/explorer/state.ts` with a reducer and serializable state:

```ts
type ExplorerState = {
  activeStageId: string;
  geographyView: "us" | "global";
  generalTab: "overview" | "facilities";
  selection:
    | { kind: "facility"; id: string }
    | { kind: "country"; code: string }
    | null;
  navigatorExpanded: boolean;
  facilityListScrollTop: number;
};
```

Use reducer actions for stage, tab, geography, selection, back, navigator, and list scroll. Do not distribute overlapping selection state across map and panel components.

### Component structure

```text
src/app/App.tsx
src/explorer/ExplorerShell.tsx
src/explorer/StageNavigator.tsx
src/explorer/SupplyMap.tsx
src/explorer/MapControls.tsx
src/explorer/MapLegend.tsx
src/explorer/SourceChart.tsx
src/explorer/InfoPanel.tsx
src/explorer/StageOverview.tsx
src/explorer/FacilityList.tsx
src/explorer/FacilityDetail.tsx
src/explorer/CountryDetail.tsx
src/explorer/MobilePanel.tsx
src/explorer/state.ts
src/lib/supplyRanking.ts
src/lib/mapProjection.ts
src/lib/facilityMeasures.ts
```

Reuse/adapt existing `EvidenceBadge`, `SourceDetails`, and `DataNeededCard` where they remain semantically useful. Remove obsolete page-only components only after the replacement is complete and their content has a new home.

### Map implementation

- Bundle MapLibre’s worker explicitly through Vite, following the proven `?worker&url` pattern.
- Use a local style with pale land, muted water, subtle borders, and no remote fonts/tiles.
- Render facilities from a stage-filtered GeoJSON source.
- Use a square-root scale for radius so circle area is proportional to the measure.
- Keep selected and keyboard-focused facility layers distinct.
- Generate curves only for verified country records.
- Derive country label anchors from geometry centroids or vetted label coordinates, never from aggregate region names.
- Use pure helpers for wrapping, viewport intersection, and label collision before binding the result to MapLibre.
- For offscreen origins, project the real country anchor, select the world copy closest to the current map center, intersect the country-to-U.S. segment with a padded viewport rectangle, and route the curve to that edge. This keeps East Asian flows on the Pacific side and avoids arbitrary port claims.
- Recompute projected overlays on `move`, `zoom`, `resize`, and stage/selection changes; key labels by country code so panning cannot duplicate them.
- If WebGL is unavailable, show an accessible non-map fallback with the same facility list and evidence language.

### Visual direction

- Use the handoff wireframe for hierarchy and density, not factual content.
- Map background: cool light blue-gray; land: warm white; boundaries: quiet slate.
- Domestic facilities: one blue family with selected/focus strokes.
- Country flows: a limited categorical palette plus line labels; color is never the only identifier.
- Typography remains Public Sans for interface text; Newsreader may remain only for a short editorial question if it supports hierarchy.
- Avoid rounded-card repetition. The panel is one continuous surface with rules, compact tabs, and restrained callouts.
- Animations are short and disabled under `prefers-reduced-motion`.

---

## 5. Implementation tasks

### Task 1: Add geospatial and facility data contracts

**Files:**

- Modify: `src/data/schema.ts`
- Modify: `scripts/compile-data.ts`
- Modify: `scripts/compile-data.test.ts`
- Modify: `src/data/schema.test.ts`
- Add: `data/facilities.csv`
- Add: `data/supply-mixes.json`
- Modify: `data/source-registry.csv`
- Modify: `docs/data-maintenance.md`
- Add: `scripts/prepare-map-data.ts`
- Add: `public/data/countries.geojson`
- Add: `public/data/us-states.geojson`

- [x] Write failing schema tests for valid/null facility measures, invalid coordinates, evidence/status rules, and an empty supply-mix list.
- [x] Write failing compiler tests for aggregate pseudo-countries, mixed denominators/origin types, unknown source/stage/country references, and totals beyond the denominator.
- [x] Implement `FacilitySchema`, `SupplyMixSchema`, resolved-source types, and compiler resolution.
- [x] Build a deterministic facility normalization script and reviewed DOE-stage lookup.
- [x] Download/pin the official source files, convert only needed boundary fields, and record versions/retrieval dates/licenses.
- [x] Compile a deliberately empty `supply-mixes.json` without treating it as an error.
- [x] Run `corepack yarn test scripts/compile-data.test.ts src/data/schema.test.ts` and `corepack yarn data:compile`.

### Task 2: Implement explorer state and stage navigation

**Files:**

- Add: `src/explorer/state.ts`
- Add: `src/explorer/state.test.ts`
- Add: `src/explorer/StageNavigator.tsx`
- Add: `src/explorer/StageNavigator.test.tsx`

- [x] Write reducer tests for stage changes, compatible/incompatible selection clearing, stable geography, tab preservation, and Back restoration.
- [x] Write interaction tests for mouse, keyboard, touch activation, branch labels, Next, and Escape.
- [x] Implement the reducer and stage navigator from the canonical stages array.
- [x] Ensure the expanded navigator overlays its parent instead of resizing map layout.
- [x] Run the focused tests and keyboard-check the DOM order.

### Task 3: Implement honest source ranking and unknown states

**Files:**

- Add: `src/lib/supplyRanking.ts`
- Add: `src/lib/supplyRanking.test.ts`
- Add: `src/explorer/SourceChart.tsx`
- Add: `src/explorer/SourceChart.test.tsx`
- Modify: `src/components/DataNeededCard.tsx`

- [x] Write tests for top five, U.S.-as-sixth, U.S.-inside-top-five, Rest of world, separate unknown origin, missing U.S., ties, rounding, and an absent/incomplete series.
- [x] Implement one pure ranking function that receives only an already validated compatible series.
- [x] Implement the accessible chart with text values, units, period, denominator, source, and origin-type label.
- [x] Render the data-needed prompt instead of a blank or inferred chart when the stage lacks a valid series.
- [x] Make country rows buttons that select only real ISO-coded countries.

### Task 4: Build the map and projection behavior

**Files:**

- Modify: `package.json`
- Modify: `yarn.lock`
- Add: `src/lib/facilityMeasures.ts`
- Add: `src/lib/facilityMeasures.test.ts`
- Add: `src/lib/mapProjection.ts`
- Add: `src/lib/mapProjection.test.ts`
- Add: `src/explorer/SupplyMap.tsx`
- Add: `src/explorer/MapControls.tsx`
- Add: `src/explorer/MapLegend.tsx`

- [x] Add MapLibre and write pure tests proving that marker area scales with the measure.
- [x] Write projection tests for visible origins, offscreen China on the Pacific edge, Europe on the Atlantic edge, wrapped longitudes, collision offsets, and no duplicate country labels.
- [x] Implement the local map style and U.S./Global controls.
- [x] Render stage-filtered active facilities with selectable, focusable equivalents in the accessible overlay/list.
- [x] Implement selected-country highlight and verified flows; assert aggregate/unknown/US records do not produce flows.
- [x] Add the WebGL fallback and reduced-motion behavior.

### Task 5: Build the single stateful information panel

**Files:**

- Add: `src/explorer/InfoPanel.tsx`
- Add: `src/explorer/StageOverview.tsx`
- Add: `src/explorer/FacilityList.tsx`
- Add: `src/explorer/FacilityDetail.tsx`
- Add: `src/explorer/CountryDetail.tsx`
- Add: `src/explorer/InfoPanel.test.tsx`

- [x] Write tests for default Overview, Facilities tab, facility selection, country selection, Back, source disclosure, no initial back arrow, and list-scroll restoration.
- [x] Implement overview copy from existing stage/evidence/question data.
- [x] Implement a list, not a page-level table, with active-stage facilities and explicit value-unavailable rows.
- [x] Implement facility detail that distinguishes nameplate from output and carries source/period/limitation.
- [x] Implement country detail only for compatible supply records.
- [x] Verify that panel transitions do not mutate map camera or stage.

### Task 6: Compose the responsive explorer and replace the article layout

**Files:**

- Modify: `src/app/App.tsx`
- Add: `src/explorer/ExplorerShell.tsx`
- Add: `src/explorer/MobilePanel.tsx`
- Modify: `src/styles.css`
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/App.integration.test.tsx`
- Modify/remove obsolete page-only components and their tests after content migration

- [x] Replace integration expectations with the explorer’s landmark, stage strip, map region, tabs, unknown sourcing state, and sources access.
- [x] Compose one shared reducer across navigator, map, chart, and panel.
- [x] Implement the full-height desktop grid and independently scrolling panel.
- [x] Implement the mobile bottom sheet without duplicating business state.
- [x] Retain a skip link, one page heading, visible focus, keyboard controls, semantic buttons/tabs, and live-region updates for selection changes.
- [x] Remove old layout code only when the corresponding evidence/source/unknown path exists in the new interface.

### Task 7: Validate behavior, content, build, and screenshots

**Files:**

- Modify: `package.json`
- Modify: `yarn.lock`
- Add: `playwright.config.ts`
- Add: `e2e/map-explorer.spec.ts`
- Add: `docs/screenshots/map-redesign/` artifacts
- Modify: `README.md`
- Modify: `docs/data-maintenance.md`

- [x] Add Playwright with deterministic local viewport fixtures and a map-ready test hook.
- [x] Test desktop overview, facilities tab, selected facility, selected country when a fixture supplies compatible data, global view, and mobile bottom sheet.
- [x] Capture 1440×900 screenshots for overview, facilities, selected facility, selected country fixture, and global view; capture 390×844 mobile overview and detail screenshots.
- [x] Inspect screenshots for clipped controls, panel overflow, navigator overlap, flow direction, label collisions, and unintended fake claims.
- [x] Run `corepack yarn format`, then `corepack yarn verify`.
- [x] Run Playwright at desktop and mobile sizes.
- [x] Confirm `dist/` contains no remote runtime data dependency and preview it using the production build.
- [x] Update the README with the explorer question, evidence limits, data contribution path, local commands, and Vercel deployment notes.

---

## 6. Acceptance criteria

- The first screen reads as a map/process explorer, not a report or dashboard.
- The map remains the majority of the desktop workspace and the panel is 360–420 px wide.
- The stage navigator expands over the map without a layout shift and exposes the actual branch taxonomy.
- All stage, tab, selection, geography, and Back behaviors are covered by automated tests.
- Selecting a new stage preserves camera/geography and clears only incompatible selection.
- Facility marker area scales with a stated comparable measure; missing and incompatible values are not silently coerced.
- Capacity is never described as output or domestic market share.
- International flows appear only for validated individual-country supply records with a common denominator.
- No aggregate region is plotted; no U.S.-to-U.S. flow is drawn.
- The source chart follows top-five + always-U.S. + Rest of world + separate unknown-origin rules.
- A missing U.S. value appears as unknown, not 0%.
- The initial panel has no Back control; selected detail Back restores the prior tab/list position.
- The project’s existing sources, caveats, evidence types, and contribution prompts remain reachable.
- Desktop and mobile screenshots have been inspected, not merely generated.
- `corepack yarn verify` and the Playwright suite pass.
- The production output remains a static Vercel-deployable site.

---

## 7. Questions that remain intentionally open

These do not block the shell redesign. The UI should expose them as unknowns or source requests.

1. Which permissively licensed dataset can provide stage-level U.S. supply by individual country on one denominator, rather than capacity or global production share?
2. For imports, which origin definition is defensible and reproducible: country of origin, export country, or substantial-transformation country?
3. Can upstream origins embedded in imported cells/modules be linked publicly without relying on proprietary shipment or bill-of-material data?
4. Which DOE facility capacity strings can be normalized confidently, and which need to remain unsized?
5. Are active/operating labels in the DOE file current enough to support a default operating-only map, or should each record carry a visible “status last checked” date?
6. Should Alaska and Hawaii appear as insets in U.S. view, or only in Global view, once facilities exist there?
7. What citation and point-of-view language should accompany disputed international boundaries?
8. When both actual production and annual capacity become available, should the map default to output with a capacity toggle or show two separate evidence views?

Until those questions are answered with reusable evidence, the implementation should prefer an explicit unknown over a plausible-looking estimate.
