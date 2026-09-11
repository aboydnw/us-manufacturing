# HTS Crosswalk Design

## Goal

Create a versioned, machine-readable mapping from solar value-chain stages to approved U.S. Harmonized Tariff Schedule statistical reporting numbers. The first release covers crystalline-silicon photovoltaic cells and modules and is suitable for a later Census International Trade API importer.

## Scope

The crosswalk contains the current statistical reporting numbers `8541420010` for crystalline-silicon photovoltaic cells not assembled into modules or panels and `8541430010` for crystalline-silicon photovoltaic cells assembled into modules or panels. Both classifications became effective on 2022-01-27. Historical predecessor codes and non-cell subassemblies classified elsewhere are excluded from this release.

The artifact defines classification and query semantics only. It does not fetch trade data or populate `supply-mixes.json`.

## Architecture

`data/hts-crosswalk.json` is the canonical reviewed artifact. A focused schema module validates its structure and domain rules. The existing data compiler loads the artifact on every data compilation and verifies that each entry references known stages and registered sources. The compiled site payload remains unchanged because the crosswalk is an ingestion input, not runtime UI data.

Each entry records:

- stable ID, stage, and technology;
- ten-digit HTS statistical reporting number and official description;
- inclusive effective start and optional exclusive effective end;
- Census import query fields and the preferred aggregation measure;
- explicit inclusion, exclusion, and direct-origin limitations;
- authoritative classification source and supporting validation sources.

## Data semantics

The future importer must request U.S. imports for consumption by individual country. Customs value is the approved common aggregation measure because Census quantity units can vary or be unsuitable for combining records. Quantity fields are retained as optional supporting measures and must never be combined across unlike units.

Country means the reported direct import origin. It does not establish the origin of embedded wafers, polysilicon, metals, or other upstream inputs. Results derived from this crosswalk must use `originType: "direct"`.

## Validation and errors

Validation rejects malformed HTS codes, duplicate entry IDs, duplicate stage/code/effective-period combinations, invalid dates, empty methodology notes, unsupported Census fields, and periods whose end is not later than their start. Compilation additionally rejects unknown stage or source references.

## Testing

Schema tests cover the approved artifact and invalid codes, periods, and duplicate classifications. Compiler tests prove that unknown stages and sources fail compilation. The repository verification command remains the acceptance gate.

## Documentation

The data-maintenance guide will describe ownership, update cadence, direct-origin limitations, and the handoff contract for the future importer. The README data workflow will identify the crosswalk as canonical ingestion metadata.
