# U.S. Solar Supply Chain V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only, source-transparent website that walks a general audience through every major step required to construct a representative U.S. solar installation, shows what is known about domestic capacity and foreign dependence, and treats missing evidence as an explicit invitation to contribute data.

**Architecture:** Use a Vite-built React single-page application deployed as static files on Vercel. Keep research inputs as small, reviewable CSV and JSON files in the repository; validate and compile them into one public JSON artifact at build time, then render a linear supply-chain narrative, evidence cards, source details, and unknown-data calls to action without a backend.

**Tech Stack:** Yarn 4.13, React 19, TypeScript 6, Vite 8, semantic HTML and authored CSS, Zod 4, Vitest 4, Testing Library, Oxlint, Prettier, static Vercel hosting. Chakra UI was removed during implementation after the bundle report showed that the interface's native semantic components did not need its runtime.

## Global Constraints

- V1 is read-only and tightly scoped to solar manufacturing.
- The primary reference is a 100 MWdc U.S. utility-scale crystalline-silicon installation with single-axis tracking and a central inverter.
- CdTe appears as a clearly separated comparison branch; it must not be merged into crystalline-silicon statistics.
- Batteries, labor, land, permitting, project finance, and bulk transmission expansion are outside V1.
- The flagship view is the value chain, not a geographic map.
- Operating capacity, announced capacity, observed production, modeled demand, imports, and global concentration are distinct measures and must never be added or visually conflated.
- Unknown values render as “We need data for this. Do you know of any?” and link to a prefilled GitHub issue.
- Every quantitative claim displays its observation year, evidence type, source, and limitations.
- No runtime API, database, account, authentication, or server-side rendering is required for V1.
- Data refreshes happen through reviewed Git commits and pull requests.
- The site must build to static assets deployable on Vercel.

---

## Product definition

### The question

> If the United States had to supply a finished solar installation from start to finish, which parts could it make domestically, which parts currently depend on other countries, which countries matter, and where is the public evidence insufficient to know?

### Intended audience

The first audience is an interested but non-specialist reader who has heard that U.S. solar depends on China and wants to understand what that statement actually means. A second audience—researchers, manufacturers, policymakers, journalists, and supply-chain practitioners—should be able to inspect the sources, challenge assumptions, and contribute better public data.

### V1 thesis

“Made in America” often describes the last manufacturing step. A domestic module-assembly line does not establish domestic production of cells, wafers, polysilicon, glass, frames, encapsulants, junction boxes, inverters, tracker drives, transformer cores, or cable metals. The site will make each layer visible while distinguishing observed facts from capacity claims, engineering models, and unknowns.

### What success looks like

A first-time reader should be able to answer these questions after one visit:

1. What major physical stages and components are required to build a utility-scale solar installation?
2. At which crystalline-silicon stages does the United States have operating nameplate capacity?
3. How does that capacity compare with a consistent annual demand benchmark?
4. How much direct cell and module supply is imported, and from which countries?
5. Where is global production concentrated even when direct U.S. imports arrive from somewhere else?
6. Which statements are observed, modeled, announced, or genuinely unknown?
7. How can a reader inspect or suggest a source?

V1 succeeds operationally when all published numbers pass schema and provenance validation, the site is usable at 360 px and 1440 px widths, core content is keyboard and screen-reader accessible, and a production build deploys on Vercel without server functions.

## V1 experience

### Page structure

V1 is one continuous editorial page with anchor navigation rather than a multi-route application:

1. **Opening:** the question, the short answer, and a compact illustration of the 100 MWdc reference installation.
2. **How to read the evidence:** a five-item legend for observed, nameplate, modeled, announced, and unknown evidence.
3. **Supply-chain journey:** a responsive horizontal chain on wide screens and vertical chain on small screens.
4. **Stage chapters:** raw materials; silicon metal and polysilicon; ingots and wafers; cells; module materials and assembly; trackers and racking; inverters; electrical balance of system; installed project.
5. **CdTe alternate branch:** a concise comparison explaining which stages and dependencies change.
6. **What breaks first?:** a synthesis based on stage-level concentration and capacity gaps, without producing a false composite score.
7. **What we still do not know:** all active data questions in one filterable list.
8. **Method and sources:** definitions, reference limitations, licenses, transformations, and the complete source registry.

Sticky anchor navigation may be added on desktop, but content remains understandable and reachable without it.

### Core component: the value-chain spine

Each stage in the spine is a button/anchor with:

- a plain-language stage name;
- a one-sentence description of what happens;
- an evidence-status marker;
- a U.S. capacity statement where comparable data exist;
- leading relevant foreign countries or regions;
- a source-count label;
- a visible unknown marker when an important field lacks evidence.

Selecting a stage scrolls to its chapter. The spine does not encode a single red/green “self-sufficient” score because evidence differs in units, dates, and meaning.

### Core component: stage chapter

Every stage chapter uses the same order:

1. **What happens here?** A two- or three-sentence explanation.
2. **What goes in / what comes out?** Material or component chips from the reference-system model.
3. **What the public evidence says:** two to five evidence cards.
4. **U.S. position:** operating nameplate, observed production, imports, and demand shown separately.
5. **Foreign dependence:** direct import origin and global production concentration shown separately.
6. **Why this could be fragile:** a short editorial interpretation constrained to the cited evidence.
7. **What we do not know:** zero or more data-needed cards.
8. **Sources and caveats:** expandable provenance rows.

### Known-unknown interaction

Unknowns are content, not empty UI states. A `DataNeededCard` displays:

> **We need data for this. Do you know of any?**
>
> We have not found a current, publicly reusable source for actual U.S. wafer-factory output and utilization. A useful source would identify the facility, observation period, output, unit, and reuse terms.

Its link targets:

```text
https://github.com/aboydnw/us-manufacturing/issues/new
  ?title=Data%20source%3A%20actual%20U.S.%20wafer%20output
  &body=Source%20URL%3A%0A%0APublisher%3A%0A%0ALicense%20or%20reuse%20terms%3A%0A%0AWhat%20the%20source%20measures%3A%0A%0AWhy%20it%20fills%20this%20gap%3A
  &labels=data-source
```

The URL is generated from each question's title and requested evidence fields. The UI must say that submissions will be reviewed for scope, methodology, and reuse rights.

### Visual principles

- Editorial and explanatory rather than control-panel-like.
- Warm neutral page background, near-black text, restrained solar yellow for the physical flow, blue for observed evidence, violet for modeled evidence, gray hatching for unknowns, and red reserved for documented concentration or disruption—not missing data.
- Numbers are never presented without units and dates.
- Tooltips are supplementary; the core meaning remains visible on touch and keyboard devices.
- Motion is limited to short opacity/position transitions and respects `prefers-reduced-motion`.
- Charts use text labels and patterns in addition to color.

## Data selected for V1

The complete source assessment remains in [`docs/research/solar-supply-chain-source-audit.md`](../../research/solar-supply-chain-source-audit.md). V1 deliberately uses a smaller source stack.

| Source | V1 role | Evidence type | Key caution |
|---|---|---|---|
| NLR Q1 2025 PV System Cost Benchmark Model | Defines the 100 MWdc system, component categories, quantities, and modeled origin assumptions | Modeled | Origin assumptions are not observed U.S. procurement |
| DOE Solar Manufacturing Map CSV, 2026-06-15 | Operating U.S. facilities and stated nameplate for silicon metal, polysilicon, wafers, cells, and modules | Reported nameplate | Capacity is not output; the map may be incomplete |
| EIA-860M and EIA-861M | Current utility-scale and small-scale solar deployment | Observed/reported | Planned additions are not completed installations |
| EIA Annual Energy Outlook 2026 | Low/base/high future-demand context | Modeled scenario | Scenarios are not predictions |
| USITC Publication 5773 | Cell/module import GW, U.S. industry capacity/utilization where public, and global c-Si stage shares | Observed/reported | Confidential producer values are redacted |
| Census International Trade API / USITC DataWeb | Country-level direct imports under a versioned HTS crosswalk | Observed | Direct origin does not reveal embedded upstream origin |
| USGS Mineral Commodity Summaries 2026 | U.S. production, import reliance, import sources, and global production for major materials | Observed/estimated | Commodity use is economy-wide, not solar-specific |
| USGS U.S. and global mineral-facility releases | Locations and processing roles for relevant minerals | Observed/reported | Coverage and capacity vary by commodity |
| NIST Building Systems v1.2026-06.0 | Process/component graph for c-Si, mounts, inverters, electrical equipment, and recycling | Modeled LCI | Many geographic consumption mixes represent 2018 |
| IEA Solar PV Global Supply Chains and ETP 2026 | Global country/region concentration and projections | Reported/modeled | Not observed purchasing by U.S. projects |
| NLR PV ICE | c-Si material intensity and manufacturing-yield scenarios | Modeled | Derived literature baselines require provenance review |
| DOL forced-labor goods list and DHS UFLPA Entity List | Clearly labeled cross-cutting risk indicators | Government risk classification | A listing does not prove a particular shipment is affected |

### Data deferred from V1

- BlueGreen Alliance facilities remain out until reuse permission is explicit.
- SEIA, Sinovoltaics, Solar Power World, ACP, ITRPV, Wood Mackenzie, and Ecoinvent are reference-only under current access or license conditions.
- The Big Green Machine and Clean Investment Monitor can support a later announcements/investment layer but are not needed to answer the initial physical-dependence question.
- EIA module-shipment series may appear as historical context later; its current collection gap makes it unsuitable as the main observed-production series.

## Seed claims for the first release

These claims establish the first narrative; implementation must preserve their definitions and citations rather than copy only the numbers.

| Claim | Stage | Evidence label | Source |
|---|---|---|---|
| Active U.S. module nameplate sums to approximately 64.2 GWdc/year in the June 2026 DOE file | Module assembly | Nameplate | DOE map CSV |
| Active U.S. c-Si cell nameplate sums to approximately 13.6 GWdc/year | Cells | Nameplate | DOE map CSV |
| Active U.S. wafer nameplate sums to 2.5 GWdc/year | Wafers | Nameplate | DOE map CSV |
| Two active U.S. polysilicon plants list a combined 51,000 tonnes/year | Polysilicon | Nameplate | DOE map CSV |
| The United States imported 33.269 GW of crystalline modules in 2025 | Module supply | Observed | USITC Publication 5773 |
| The United States imported 21.749 GW of crystalline cells in 2025 | Cell supply | Observed | USITC Publication 5773 |
| China accounted for 93.2% of global polysilicon, 96.6% of wafers, 92.3% of cells, and 86.4% of modules in 2024 | Global c-Si chain | Reported estimate | USITC Publication 5773 |
| Developers planned 43.4 GW of utility-scale PV additions in 2026 | Demand context | Announced/planned | EIA Today in Energy / EIA-860M |

The word “approximately” is required for computed DOE totals because the sum depends on record filtering and DOE's nameplate definitions. The 43.4 GW planned value must not be used as if it were completed 2026 demand.

## Remaining questions

Each question below ships as an explicit unknown in V1 unless a permissively reusable source is added through review.

### Definitions and denominators

These are genuine methodological questions, but they do not block V1. The release treatment is fixed as follows: use completed additions from the latest full EIA calendar year as the primary historical denominator; show planned 2026 additions separately; use the NLR reference model's explicit DC/AC ratio for equipment conversions; define “domestic” independently at each manufacturing stage by physical factory location; and leave nameplate unadjusted unless a sourced utilization or yield observation exists.

1. What should be the primary annual demand denominator when comparing nameplate capacity: completed installations in the latest full calendar year, the latest trailing twelve months, or a near-term modeled year?
2. How should GWac equipment such as inverters and transformers be compared with GWdc module demand? V1 should display the assumed DC/AC ratio rather than silently convert.
3. Which standard should govern “domestic”: factory location, substantial transformation, Treasury domestic-content rules, or physical origin by mass? V1 uses stage location and avoids a binary whole-system label.
4. How should factory capacity be adjusted for yield, ramp time, maintenance, and product incompatibility? Until observed factors exist, nameplate remains unadjusted and clearly labeled.

### Raw materials and silicon

5. How much U.S. quartz production is suitable for solar-grade polysilicon, and where is it refined?
6. What is actual annual output and utilization at U.S. silicon-metal and polysilicon plants?
7. What share of domestic polysilicon output is suitable for or sold into photovoltaic applications rather than semiconductors or export markets?
8. Where do graphite crucibles, diamond wire, and key purification chemicals originate?

### Wafers, cells, and modules

9. What is actual output, yield, technology, and utilization at the U.S. wafer plant or plants?
10. Which wafer and polysilicon origins are embedded in cells imported from each direct partner country?
11. What share of domestically assembled modules uses domestically produced cells?
12. Which U.S. projects purchased which module models and manufacturing batches?
13. What current domestic capacity exists for solar glass, aluminum frames, encapsulant, backsheets, junction boxes, ribbon, connectors, sealants, and silver paste?
14. What fraction of those component factories' output is allocated to solar?
15. What are current physical material intensities for mainstream U.S. bifacial TOPCon modules rather than the broader historical c-Si average?

### Trackers, inverters, and electrical equipment

16. What operating U.S. nameplate and actual output exist for tracker/racking systems?
17. Where do tracker motors, actuators, dampers, bearings, controllers, and fasteners originate?
18. Which central and string inverter models are installed in U.S. utility projects, and where are they assembled?
19. Which semiconductor fabs, PCB plants, capacitor suppliers, and magnetics plants supply those inverters?
20. What U.S. output, utilization, backlog, and lead time exist for solar-suitable transformers, switchgear, breakers, combiner boxes, and cable?
21. Where are transformer grain-oriented electrical steel, copper windings, bushings, and insulating materials produced?

### CdTe

22. What is a current, openly reusable CdTe module and system bill of materials?
23. What shares of tellurium and cadmium supply are recovered as by-products, and how elastic is that supply if CdTe demand grows?
24. What share of CdTe processing and module inputs is domestic at each physical stage?
25. How should vertically integrated CdTe capacity be compared with separately reported c-Si wafer, cell, and module stages?

### Market behavior and resilience

26. What percentage of annual U.S. installations comes from domestic production rather than imports?
27. How much operating capacity has firm customer demand rather than only stated nameplate?
28. How quickly could another country or U.S. factory substitute for the top supplier after a disruption?
29. Where are single-factory, single-port, single-technology, or single-company dependencies hidden by country totals?
30. Can the BlueGreen Alliance facility layer be reused under a written permissive license?

## File structure

```text
.
├── data/
│   ├── source-registry.csv              # Existing canonical source inventory
│   ├── stages.json                      # Ordered value-chain stages and branch relationships
│   ├── observations.csv                 # Quantitative and qualitative sourced claims
│   ├── reference-system.json            # 100 MWdc design and component graph
│   └── questions.json                   # Known unknowns and GitHub contribution prompts
├── docs/
│   ├── research/
│   │   └── solar-supply-chain-source-audit.md
│   └── superpowers/plans/
│       └── 2026-09-10-v1-solar-supply-chain-story.md
├── public/
│   └── data/
│       └── site-data.json                # Generated, public, not hand-edited
├── scripts/
│   ├── compile-data.ts                  # Validates canonical data and generates site-data.json
│   └── check-content.ts                 # Enforces source, status, unit, and unknown-copy rules
├── src/
│   ├── app/App.tsx                      # Page composition and anchor navigation
│   ├── components/
│   │   ├── CapacityComparison.tsx       # Comparable capacity/demand bars with definition guards
│   │   ├── DataNeededCard.tsx           # Unknown state and prefilled GitHub issue link
│   │   ├── EvidenceBadge.tsx             # Observed/nameplate/modeled/announced/unknown legend
│   │   ├── EvidenceCard.tsx              # Claim, value, year, source, and limitation
│   │   ├── ReferenceInstallation.tsx    # 100 MWdc system summary and component categories
│   │   ├── SourceDetails.tsx             # Expandable source/license/provenance row
│   │   ├── StageChapter.tsx              # Reusable narrative chapter
│   │   ├── SupplyChainSpine.tsx          # Responsive value-chain navigation
│   │   └── TechnologyBranch.tsx          # c-Si versus CdTe boundary and comparison
│   ├── data/
│   │   ├── schema.ts                    # Shared Zod schemas and inferred types
│   │   └── useSiteData.ts               # Fetches and validates generated static JSON
│   ├── theme/
│   │   └── index.ts                     # Semantic visual tokens and accessible component styles
│   ├── test/
│   │   ├── fixtures.ts                  # Complete typed factories for tests
│   │   └── setup.ts                     # Testing Library matchers and DOM setup
│   ├── main.tsx
│   └── styles.css                        # Narrative layout, print rules, reduced motion
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## Canonical data contracts

The canonical repository data use stable IDs and explicit evidence semantics.

```ts
export const EvidenceType = z.enum([
  "observed",
  "nameplate",
  "modeled",
  "announced",
  "unknown",
]);

export const Technology = z.enum(["shared", "c-si", "cdte"]);

export const StageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().nonnegative(),
  technology: Technology,
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(1),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export const ObservationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stageId: z.string(),
  sourceId: z.string(),
  metric: z.string().min(1),
  value: z.number().nullable(),
  displayValue: z.string().min(1),
  unit: z.string(),
  geography: z.string().min(1),
  period: z.string().min(1),
  evidenceType: EvidenceType,
  definition: z.string().min(1),
  limitation: z.string().min(1),
  calculation: z.string().nullable(),
});

export const QuestionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stageId: z.string(),
  title: z.string().min(1),
  missingMeasure: z.string().min(1),
  usefulSourceWouldInclude: z.array(z.string()).min(1),
  issueLabel: z.literal("data-source"),
});
```

`source-registry.csv` remains the canonical source list. `compile-data.ts` must reject observations with missing source IDs, questions with missing stage IDs, duplicate IDs, invalid evidence types, negative capacity values, or observed/nameplate records with empty periods. Unknown observations use `value = null`, `displayValue = "Unknown"`, `unit = ""`, and `evidenceType = "unknown"`.

## Implementation tasks

### Task 1: Static application foundation

**Files:**
- Create: `package.json`
- Create: `.yarnrc.yml`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/test/setup.ts`
- Create: `src/app/App.test.tsx`
- Create: `vercel.json`

**Interfaces:**
- Consumes: none.
- Produces: a React/Vite static app with `dev`, `build`, `test`, `typecheck`, `lint`, `format:check`, `data:compile`, and `verify` scripts.

- [ ] **Step 1: Write the failing application smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import { App } from "./App";

it("introduces the U.S. solar supply-chain question", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /how dependent is a u\.s\. solar installation/i,
    }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the smoke test and confirm the empty repository fails**

Run: `yarn test src/app/App.test.tsx`

Expected: FAIL because the app and test configuration do not exist.

- [ ] **Step 3: Add the Vite/React/Chakra foundation and scripts**

Use Yarn 4.13 and the versions named in the Tech Stack. Configure Vitest with `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`, and React's Vite plugin. `App.tsx` initially renders the tested heading inside Chakra's provider. Configure `vercel.json` to serve the Vite `dist` directory without server functions.

```json
{
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 4: Run the foundation checks**

Run: `yarn test src/app/App.test.tsx && yarn typecheck && yarn build`

Expected: one passing test, successful TypeScript check, and a generated `dist/index.html`.

- [ ] **Step 5: Commit the foundation**

```bash
git add package.json .yarnrc.yml yarn.lock tsconfig.json vite.config.ts index.html vercel.json src
git commit -m "feat: scaffold static solar supply chain site"
```

### Task 2: Canonical data contracts and compiler

**Files:**
- Create: `src/data/schema.ts`
- Create: `scripts/compile-data.ts`
- Create: `scripts/compile-data.test.ts`
- Create: `data/stages.json`
- Create: `data/observations.csv`
- Create: `data/reference-system.json`
- Create: `data/questions.json`
- Create: `src/test/fixtures.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `data/source-registry.csv` and the contracts in this plan.
- Produces: `compileData(rootDir: string): SiteData` and generated `public/data/site-data.json`.

- [ ] **Step 1: Write compiler tests for valid and invalid provenance**

```ts
it("compiles records whose stage and source IDs resolve", () => {
  const data = compileData(dataRootFixture("valid"));
  expect(data.observations[0].source.id).toBe("doe_pv_mfg_map_20260615");
});

it("rejects an observation with an unknown source", () => {
  expect(() => compileData(dataRootFixture("missing-source"))).toThrow(
    /unknown source id/i,
  );
});

it("rejects a question with an unknown stage", () => {
  expect(() => compileData(dataRootFixture("missing-stage"))).toThrow(
    /unknown stage id/i,
  );
});
```

- [ ] **Step 2: Run the compiler tests and confirm they fail**

Run: `yarn vitest run scripts/compile-data.test.ts`

Expected: FAIL because `compileData` and schemas do not exist.

- [ ] **Step 3: Implement schemas, compiler, and seed data**

Implement the exact Zod contracts above. Parse the canonical source CSV, join source metadata into each observation, validate cross-references and comparison units, and write formatted JSON. Seed all stages, the eight release claims, the 30 remaining questions, and the NREL reference-system categories. Each seed claim includes the exact source ID already present in the registry and the limitation shown in this plan. In `src/test/fixtures.ts`, implement `dataRootFixture(kind)`, `observationFixture(overrides)`, `questionFixture(overrides)`, and `siteDataFixture(overrides)`; the root fixture writes complete canonical files beneath `mkdtempSync(join(tmpdir(), "solar-data-"))`, while record factories return complete schema-valid objects with typed partial overrides.

- [ ] **Step 4: Add compilation to development and production commands**

```json
{
  "scripts": {
    "data:compile": "tsx scripts/compile-data.ts",
    "predev": "yarn data:compile",
    "prebuild": "yarn data:compile"
  }
}
```

- [ ] **Step 5: Verify compilation and rejection tests**

Run: `yarn vitest run scripts/compile-data.test.ts && yarn data:compile`

Expected: all compiler tests pass and `public/data/site-data.json` contains ordered stages, joined observations, source metadata, the reference system, and questions.

- [ ] **Step 6: Commit the data foundation**

```bash
git add data package.json yarn.lock public/data/site-data.json scripts src/data
git commit -m "feat: add validated solar supply chain data model"
```

### Task 3: Data loading, evidence semantics, and source details

**Files:**
- Create: `src/data/useSiteData.ts`
- Create: `src/data/useSiteData.test.tsx`
- Create: `src/components/EvidenceBadge.tsx`
- Create: `src/components/EvidenceBadge.test.tsx`
- Create: `src/components/EvidenceCard.tsx`
- Create: `src/components/SourceDetails.tsx`

**Interfaces:**
- Consumes: `SiteDataSchema` and `/data/site-data.json`.
- Produces: `useSiteData(): { status: "loading" | "ready" | "error"; data?: SiteData; error?: Error }`, `EvidenceBadge`, `EvidenceCard`, and `SourceDetails`.

- [ ] **Step 1: Write tests for loading and evidence labels**

```tsx
it("labels nameplate capacity without calling it production", () => {
  render(<EvidenceBadge type="nameplate" />);
  expect(screen.getByText("Reported nameplate")).toBeVisible();
});

it("reports invalid generated data as an error", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ observations: "invalid" }),
    }),
  );
  const { result } = renderHook(() => useSiteData());
  await waitFor(() => expect(result.current.status).toBe("error"));
});
```

- [ ] **Step 2: Run the tests and confirm missing components fail**

Run: `yarn vitest run src/data/useSiteData.test.tsx src/components/EvidenceBadge.test.tsx`

Expected: FAIL because the hook and components do not exist.

- [ ] **Step 3: Implement loading and evidence display**

Map evidence types to these exact public labels: `observed → Observed`, `nameplate → Reported nameplate`, `modeled → Modeled`, `announced → Announced or planned`, `unknown → Data needed`. `EvidenceCard` always renders period, geography, definition, limitation, and a `SourceDetails` disclosure with publisher, source title, URL, license, and last-verified date.

- [ ] **Step 4: Verify accessible evidence components**

Run: `yarn vitest run src/data/useSiteData.test.tsx src/components/EvidenceBadge.test.tsx && yarn typecheck`

Expected: tests and typecheck pass.

- [ ] **Step 5: Commit evidence semantics**

```bash
git add src/data src/components
git commit -m "feat: render explicit evidence and provenance states"
```

### Task 4: Unknown-data contribution flow

**Files:**
- Create: `src/components/DataNeededCard.tsx`
- Create: `src/components/DataNeededCard.test.tsx`
- Create: `src/lib/githubIssue.ts`
- Create: `src/lib/githubIssue.test.ts`

**Interfaces:**
- Consumes: `Question` records.
- Produces: `buildDataIssueUrl(question: Question): string` and `DataNeededCard`.

- [ ] **Step 1: Write the URL and accessible-copy tests**

```ts
const question = {
  id: "wafer-output",
  stageId: "ingots-wafers",
  title: "actual U.S. wafer output",
  missingMeasure: "Annual factory output and utilization",
  usefulSourceWouldInclude: ["facility", "period", "output", "unit", "license"],
  issueLabel: "data-source",
} satisfies Question;

it("creates a prefilled issue with requested provenance fields", () => {
  const url = new URL(buildDataIssueUrl(question));
  expect(url.pathname).toBe("/aboydnw/us-manufacturing/issues/new");
  expect(url.searchParams.get("labels")).toBe("data-source");
  expect(url.searchParams.get("body")).toContain("License or reuse terms:");
  expect(url.searchParams.get("body")).toContain("Source URL:");
});
```

```tsx
it("asks for data without presenting an unknown as zero", () => {
  render(<DataNeededCard question={question} />);
  expect(screen.getByText(/we need data for this/i)).toBeVisible();
  expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `yarn vitest run src/lib/githubIssue.test.ts src/components/DataNeededCard.test.tsx`

Expected: FAIL because the URL builder and card do not exist.

- [ ] **Step 3: Implement the contribution flow**

Generate the issue title as `Data source: ${question.title}`. Generate a body containing `Source URL`, `Publisher`, `License or reuse terms`, `What the source measures`, and `Why it fills this gap`, followed by the question's requested fields. Open GitHub in a new tab and provide an accessible external-link label.

- [ ] **Step 4: Verify the contribution flow**

Run: `yarn vitest run src/lib/githubIssue.test.ts src/components/DataNeededCard.test.tsx`

Expected: URL encoding, labels, copy, and the non-zero unknown state all pass.

- [ ] **Step 5: Commit the unknown-data pattern**

```bash
git add src/components/DataNeededCard* src/lib/githubIssue*
git commit -m "feat: invite public sources for known data gaps"
```

### Task 5: Reference installation and value-chain navigation

**Files:**
- Create: `src/components/ReferenceInstallation.tsx`
- Create: `src/components/SupplyChainSpine.tsx`
- Create: `src/components/SupplyChainSpine.test.tsx`
- Create: `src/components/TechnologyBranch.tsx`
- Create: `src/styles.css`

**Interfaces:**
- Consumes: ordered `Stage[]`, `ReferenceSystem`, and active stage ID.
- Produces: a responsive semantic navigation spine and technology-branch boundary.

- [ ] **Step 1: Write navigation and branch tests**

```tsx
const stages = [
  {
    id: "cells",
    order: 3,
    technology: "c-si",
    title: "Cells",
    shortTitle: "Cells",
    summary: "Wafers are processed into electricity-producing cells.",
    inputs: ["wafer"],
    outputs: ["cell"],
  },
  {
    id: "cdte-module",
    order: 4,
    technology: "cdte",
    title: "CdTe module",
    shortTitle: "CdTe",
    summary: "Semiconductor layers are deposited directly onto glass.",
    inputs: ["glass", "cadmium", "tellurium"],
    outputs: ["module"],
  },
] satisfies Stage[];

it("keeps crystalline silicon and CdTe stages distinct", () => {
  render(<SupplyChainSpine stages={stages} />);
  expect(screen.getByRole("navigation", { name: /supply chain/i })).toBeVisible();
  expect(screen.getByText("Crystalline silicon")).toBeVisible();
  expect(screen.getByText("CdTe comparison")).toBeVisible();
});

it("links every stage to its chapter", () => {
  render(<SupplyChainSpine stages={stages} />);
  expect(screen.getByRole("link", { name: /cells/i })).toHaveAttribute(
    "href",
    "#cells",
  );
});
```

- [ ] **Step 2: Run tests and confirm missing components fail**

Run: `yarn vitest run src/components/SupplyChainSpine.test.tsx`

Expected: FAIL because the spine does not exist.

- [ ] **Step 3: Implement semantic responsive navigation**

Use an ordered list inside a labeled `nav`. Use anchor links, not click-only divs. Render horizontally above 62rem and vertically below it. Place CdTe in a separately labeled branch. `ReferenceInstallation` states 100 MWdc, single-axis tracking, central inverter, and modeled benchmark year; it excludes storage even if the upstream NREL workbook contains storage inputs.

- [ ] **Step 4: Verify navigation and responsive CSS contracts**

Run: `yarn vitest run src/components/SupplyChainSpine.test.tsx && yarn typecheck`

Expected: all stage anchors and branch labels pass.

- [ ] **Step 5: Commit the narrative spine**

```bash
git add src/components/ReferenceInstallation.tsx src/components/SupplyChainSpine* src/components/TechnologyBranch.tsx src/styles.css
git commit -m "feat: add solar value chain narrative spine"
```

### Task 6: Stage chapters and valid capacity comparisons

**Files:**
- Create: `src/components/StageChapter.tsx`
- Create: `src/components/StageChapter.test.tsx`
- Create: `src/components/CapacityComparison.tsx`
- Create: `src/components/CapacityComparison.test.tsx`

**Interfaces:**
- Consumes: `Stage`, its `Observation[]`, `Question[]`, and source details.
- Produces: repeated stage chapters and `canCompare(a, b): { comparable: boolean; reason?: string }`.

- [ ] **Step 1: Write comparison-guard and chapter tests**

```ts
const polysiliconTonnes = observationFixture({
  metric: "polysilicon-nameplate",
  value: 51_000,
  displayValue: "51,000 tonnes/year",
  unit: "tonnes/year",
  evidenceType: "nameplate",
});
const moduleGw = observationFixture({
  metric: "module-nameplate",
  value: 64.2,
  displayValue: "64.2 GWdc/year",
  unit: "GWdc/year",
  evidenceType: "nameplate",
});

it("refuses to compare tonnes of polysilicon directly with GWdc demand", () => {
  expect(canCompare(polysiliconTonnes, moduleGw)).toEqual({
    comparable: false,
    reason: "These values use different units and require a documented conversion.",
  });
});
```

```tsx
const waferStage = {
  id: "ingots-wafers",
  order: 2,
  technology: "c-si",
  title: "Ingots and wafers",
  shortTitle: "Wafers",
  summary: "Polysilicon is crystallized and sliced into wafers.",
  inputs: ["polysilicon"],
  outputs: ["wafer"],
} satisfies Stage;
const facts = [observationFixture({ stageId: waferStage.id, evidenceType: "nameplate" })];
const gaps = [questionFixture({ stageId: waferStage.id })];

it("renders evidence and questions for a stage", () => {
  render(<StageChapter stage={waferStage} observations={facts} questions={gaps} />);
  expect(screen.getByRole("heading", { name: "Ingots and wafers" })).toBeVisible();
  expect(screen.getAllByText(/reported nameplate/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/we need data for this/i)).toBeVisible();
});
```

- [ ] **Step 2: Run tests and confirm missing components fail**

Run: `yarn vitest run src/components/CapacityComparison.test.tsx src/components/StageChapter.test.tsx`

Expected: FAIL because the chapter and comparison guard do not exist.

- [ ] **Step 3: Implement chapters and guarded charts**

Only render a shared-axis bar comparison when normalized units, technology branch, period basis, and AC/DC basis match. Otherwise render separate evidence cards plus the comparison reason. Use plain SVG or CSS bars with visible text labels; do not add a charting dependency for these small comparisons.

- [ ] **Step 4: Verify semantic and unit behavior**

Run: `yarn vitest run src/components/CapacityComparison.test.tsx src/components/StageChapter.test.tsx && yarn typecheck`

Expected: mixed units are rejected, unknowns are not rendered as zero, and each chapter exposes evidence and source details.

- [ ] **Step 5: Commit the stage narrative**

```bash
git add src/components/CapacityComparison* src/components/StageChapter*
git commit -m "feat: explain evidence at each solar supply chain stage"
```

### Task 7: Editorial page composition and visual system

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/app/App.integration.test.tsx`
- Create: `src/theme/index.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `useSiteData` and all components from Tasks 3–6.
- Produces: the complete one-page V1 experience.

- [ ] **Step 1: Write an integration test for the complete reading path**

```tsx
it("renders the reference system, all stages, synthesis, unknowns, and sources", async () => {
  render(<App />);
  expect(await screen.findByText("100 MWdc reference installation")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Raw materials" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Installed project" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "What we still do not know" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Method and sources" })).toBeVisible();
});
```

- [ ] **Step 2: Run the integration test and confirm the incomplete page fails**

Run: `yarn vitest run src/app/App.integration.test.tsx`

Expected: FAIL because the full page is not composed.

- [ ] **Step 3: Compose the complete page**

Implement the page structure in this plan. The opening short answer states that U.S. module assembly has expanded faster than upstream wafer and cell capacity, while evidence about actual throughput and embedded origin remains incomplete. The “What breaks first?” section compares stage observations without a composite score. The unknowns index groups questions by stage and uses the same contribution links as stage chapters.

- [ ] **Step 4: Implement semantic tokens and layouts**

Define tokens for `evidence.observed`, `evidence.nameplate`, `evidence.modeled`, `evidence.announced`, and `evidence.unknown`. Add 360 px, 768 px, and 1200 px layout checks in CSS; print styles expand source disclosures; reduced-motion styles remove transitions. Avoid fixed card heights.

- [ ] **Step 5: Verify the full page**

Run: `yarn vitest run src/app/App.integration.test.tsx && yarn typecheck && yarn build`

Expected: integration test, typecheck, and static build pass.

- [ ] **Step 6: Commit the V1 page**

```bash
git add src/app src/theme src/styles.css
git commit -m "feat: assemble the solar supply chain data story"
```

### Task 8: Content safeguards, accessibility, and metadata

**Files:**
- Create: `scripts/check-content.ts`
- Create: `scripts/check-content.test.ts`
- Modify: `package.json`
- Modify: `index.html`
- Modify: `src/app/App.integration.test.tsx`

**Interfaces:**
- Consumes: canonical data and rendered app.
- Produces: a failing command when provenance, evidence labels, units, dates, or required unknown copy are absent.

- [ ] **Step 1: Write safeguard tests**

```ts
const siteDataWithoutPeriod = siteDataFixture();
siteDataWithoutPeriod.observations[0].period = "";
const siteDataWithoutLimitation = siteDataFixture();
siteDataWithoutLimitation.observations[0].limitation = "";
const siteDataWithUntrackedUnknown = siteDataFixture();
siteDataWithUntrackedUnknown.questions = [];

it("rejects a quantitative claim without a source period and limitation", () => {
  expect(() => checkContent(siteDataWithoutPeriod)).toThrow(/period/i);
  expect(() => checkContent(siteDataWithoutLimitation)).toThrow(/limitation/i);
});

it("requires a contribution question for every unknown stage", () => {
  expect(() => checkContent(siteDataWithUntrackedUnknown)).toThrow(
    /data question/i,
  );
});
```

- [ ] **Step 2: Run safeguards and confirm they fail**

Run: `yarn vitest run scripts/check-content.test.ts`

Expected: FAIL because the checker does not exist.

- [ ] **Step 3: Implement the content checker and metadata**

Check source IDs, periods, limitations, units, evidence types, and require at least one contribution question for every stage marked unknown. The exact public unknown copy remains enforced by `DataNeededCard.test.tsx`. Add descriptive page title, meta description, canonical GitHub project URL, Open Graph text metadata, skip link, one `h1`, ordered heading levels, labeled navigation, and visible focus styles.

- [ ] **Step 4: Add the complete verification command**

```json
{
  "scripts": {
    "content:check": "tsx scripts/check-content.ts",
    "verify": "yarn format:check && yarn lint && yarn typecheck && yarn test && yarn content:check && yarn build"
  }
}
```

- [ ] **Step 5: Run complete local verification**

Run: `yarn verify`

Expected: formatting, lint, typecheck, tests, content checks, and production build all exit successfully.

- [ ] **Step 6: Commit safeguards**

```bash
git add scripts package.json index.html src/app/App.integration.test.tsx
git commit -m "test: enforce evidence and accessibility requirements"
```

### Task 9: Documentation and Vercel deployment readiness

**Files:**
- Create: `README.md`
- Create: `docs/data-maintenance.md`
- Create: `.github/ISSUE_TEMPLATE/data-source.yml`
- Create: `.github/labels.yml`
- Modify: `data/source-registry.csv`

**Interfaces:**
- Consumes: build and data workflows from all previous tasks.
- Produces: contributor instructions, structured source submissions, and deploy-ready repository documentation.

- [ ] **Step 1: Write the maintenance acceptance checklist**

The documentation must require a source URL, publisher, observation period, license/reuse terms, geography, units, evidence type, transformation notes, and limitations for every new claim. It must state that “publicly accessible” is not equivalent to permission to republish.

- [ ] **Step 2: Add the structured GitHub data-source issue form**

Use form fields for source URL, publisher, license, measured quantity, geography, period, relevant stage, and why it fills a gap. Apply the `data-source` label. Do not request personal contact information.

- [ ] **Step 3: Document local and deployment commands**

`README.md` includes `corepack enable`, `yarn install`, `yarn dev`, `yarn verify`, and the Vercel build/output settings. `docs/data-maintenance.md` explains canonical versus generated files, source-ID stability, refresh dates, calculated observations, and the review checklist.

- [ ] **Step 4: Verify from a clean dependency install**

Run: `yarn install --immutable && yarn verify`

Expected: immutable install and the full verification suite pass; `dist/` contains the static site and `dist/data/site-data.json`.

- [ ] **Step 5: Review the production preview manually**

Run: `yarn dev --host 0.0.0.0`

Check at 360 × 800 and 1440 × 1000: no horizontal page overflow; the spine becomes vertical on mobile; every stage is keyboard reachable; source links open correctly; unknown cards open a correctly prefilled GitHub issue; no unknown is shown as zero; c-Si and CdTe remain visually distinct.

- [ ] **Step 6: Commit deployment documentation**

```bash
git add README.md docs/data-maintenance.md .github data/source-registry.csv
git commit -m "docs: add source contribution and deployment workflow"
```

## V1 acceptance checklist

- [ ] One continuous page tells the physical start-to-finish story.
- [ ] The 100 MWdc reference system and its modeled nature are explicit.
- [ ] Crystalline silicon is primary; CdTe is a separate comparison branch.
- [ ] All nine stage chapters render in logical order.
- [ ] The eight seed claims render with dates, units, evidence labels, limitations, and sources.
- [ ] Capacity, production, imports, global concentration, and demand are visually distinct.
- [ ] Incompatible units cannot share a comparison axis.
- [ ] All 30 remaining questions appear as data-needed states.
- [ ] Every data-needed state opens a prefilled GitHub issue.
- [ ] Every source displays publisher, title, URL, license, and verification date.
- [ ] The site works without JavaScript-dependent server APIs or credentials.
- [ ] Mobile, keyboard, reduced-motion, and print/source behavior are verified.
- [ ] `yarn verify` and a Vercel production build pass.

## Explicitly deferred beyond V1

- Automated scheduled ingestion from EIA, Census, USGS, DOE, or IEA.
- A factory map or project map.
- User accounts, comments, voting, or an internal submission database.
- A single “American-made percentage” or composite resilience score.
- Project-level vendor attribution without a reusable national source.
- Batteries, residential-system-specific storytelling, labor, permitting, financing, and bulk transmission.
- Counterfactual disruption simulation.
- Administrative content editing outside Git pull requests.

These deferrals keep V1 focused on a credible explanatory story and prevent weak data from masquerading as precision.
