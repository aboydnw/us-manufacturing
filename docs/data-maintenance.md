# Data maintenance

The site is an editorial publication backed by local, reviewable source files. It does not fetch third-party APIs in a visitor's browser and does not silently update numbers. Every refresh is a Git change that can be reviewed alongside its source, definition, and effect on the story.

## Canonical and generated files

Edit only the canonical files in `data/`:

| File                    | Responsibility                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `source-registry.csv`   | Publisher, URL, license, access, coverage, limitations, priority, and review status          |
| `stages.json`           | Ordered physical stages and c-Si/CdTe branch membership                                      |
| `observations.csv`      | Values, units, dates, evidence semantics, definitions, limitations, and calculations         |
| `reference-system.json` | The 100 MWdc benchmark and its component/origin assumptions                                  |
| `questions.json`        | Missing measures and the evidence a useful source would contain                              |
| `facilities.csv`        | Normalized operating U.S. manufacturing facilities and comparable nameplate measures         |
| `supply-mixes.json`     | Denominator-compatible individual-country U.S. supply series; empty is a valid unknown state |

`public/data/site-data.json` is generated. Run `corepack yarn data:compile` after a canonical edit and commit the resulting diff so the exact public snapshot remains auditable.

The display boundaries in `public/data/countries.geojson` and `public/data/us-states.geojson` are also generated, but are checked in so visitors never depend on a third-party tile service. They currently derive from Natural Earth Admin 0 Countries 1:50m v5.1.1 and the Census Bureau's 2025 1:20m state cartographic boundaries.

## Facility and map refresh

Download the dated DOE CSV, the pinned Natural Earth GeoJSON, and the Census state shapefile into a temporary directory. Extract the Census archive, then run:

```bash
node --import tsx scripts/prepare-map-data.ts \
  /path/to/us_pv_mfg_map_YYYYMMDD.csv \
  /path/to/ne_50m_admin_0_countries.geojson \
  /path/to/cb_YYYY_us_state_20m.shp
```

The script includes only DOE records explicitly marked as manufacturing and only sectors mapped to the project's current stage taxonomy. It converts comparable MWdc/MWac capacities to GWdc/GWac and `kt/yr` silicon values to tonnes/year. Mixed product categories remain unsized even when DOE publishes a number; this prevents glass, connectors, module assembly, and electrical components from sharing a misleading scale.

After any refresh, inspect added/removed facilities, confirm the DOE period and source registry entry, then run the compiler and full verification suite.

`supply-mixes.json` is the exclusive input for country rankings and international flows. Add a series only when every country record uses the same product, period, measure, unit, denominator, and origin definition. Do not add “Rest of world,” another aggregate region, or unknown origin as a country: the application derives Rest of world and keeps unknown origin separate.

## Required evidence fields

Every new quantitative claim requires:

- a stable observation ID;
- an existing stage ID and source ID;
- the metric and numeric value;
- a human-readable display value;
- an explicit unit;
- geography and observation period;
- one evidence type: `observed`, `nameplate`, `modeled`, `announced`, or `unknown`;
- a definition that says exactly what the value represents;
- a limitation that says what it does not establish;
- a calculation when the displayed value was derived rather than copied.

Every new source requires:

- source title, publisher, and direct URL;
- license or reuse terms and their URL when available;
- access method and available formats;
- geographic and temporal coverage;
- update cadence, relevant value-chain stages, and key fields;
- the question it can support and its known limitations;
- ingestion priority, current review status, and verification date.

“Free,” “public,” “downloadable,” and “visible in a dashboard” do not by themselves grant permission to republish a dataset. Federal public-domain material, CC0, CC BY 4.0, and clearly scoped permissive data licenses are acceptable by default. Mixed-source compilations and datasets without explicit terms require review.

## Evidence semantics

- **Observed:** a completed-period measurement or official reported flow.
- **Reported nameplate:** maximum rated annual factory output. It is not production, shipments, or availability.
- **Modeled:** an engineering benchmark, conversion, or scenario.
- **Announced or planned:** future activity that may not happen.
- **Data needed:** the project has not found suitable public evidence. Never encode this as zero.

Do not place values on one comparison axis unless units, technology branch, period basis, and DC/AC basis are compatible. A tonnes/year polysilicon value cannot be compared with GWdc/year without a sourced material-intensity and yield conversion.

## Refresh procedure

1. Save or link the original source and verify its reuse terms.
2. Update `source-registry.csv` without changing an existing source ID.
3. Add or revise observations with the source's actual observation period—not the date you accessed it.
4. Record every arithmetic transformation in `calculation`.
5. Run `corepack yarn data:compile` and inspect the generated diff.
6. Run `corepack yarn verify`.
7. In the pull request, explain which public claim changes and why.

If two credible sources disagree, keep both observations when their definitions are materially different. Explain the disagreement in limitations rather than silently choosing the larger or newer number.

## Reviewing a suggested source

Confirm all of the following before closing a `data-source` issue:

- It measures the physical stage or component named in the question.
- Its geography, period, unit, and status are explicit.
- It distinguishes capacity, output, shipments, imports, and announcements.
- Its methodology is available or adequately described.
- Its reuse terms permit the proposed use.
- It does not turn a broad economy-wide commodity statistic into a solar-specific claim.
- It does not infer upstream origin solely from the final country of import.

When a source is useful only for context, add it to the registry as `reference_only` rather than translating it into a product observation.
