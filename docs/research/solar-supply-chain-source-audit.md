# U.S. Solar Supply-Chain Public Data Audit

This audit defines an open-data foundation for answering one question: **How dependent is a finished U.S. solar installation on other countries, at every step from raw material to operating plant, and where are the fragile links?** It was last verified on 2026-09-10. The companion machine-readable tracker is [`data/source-registry.csv`](../../data/source-registry.csv).

## Executive findings

1. **No existing public dataset answers the whole question.** The required evidence is split among plant-capacity maps, mineral statistics, trade records, deployment data, engineering bill-of-material models, and global supply-chain reports. Several attractive industry maps either reserve their data for members, require a form, prohibit reproduction, or publish no clear data license.
2. **A defensible open-data product is possible.** The strongest backbone is U.S. federal public-domain data plus clearly licensed CC BY or CC0 datasets. DOE can locate domestic factories and nameplate capacity; EIA and Berkeley Lab can measure installations; Census/USITC can measure direct import origin; USGS can measure raw-material production and net import reliance; NREL and NIST can define what is physically inside a representative system; IEA can supply global processing concentration.
3. **“Made in America” cannot be represented by one percentage.** At minimum the site should keep three measures separate: domestic nameplate capacity, observed domestic production or shipments, and foreign concentration/import origin. A module assembled in the United States can still contain imported cells, glass, frames, encapsulant, junction boxes, and ribbon.
4. **The largest visible U.S. mismatch is upstream of module assembly.** DOE's June 2026 map lists roughly 64.2 GWdc/year of active module nameplate capacity but only 13.6 GWdc/year of crystalline-silicon cell capacity and 2.5 GWdc/year of wafer capacity. It lists two active polysilicon plants totaling 51,000 metric tons/year. These are nameplate values, not production, and different sources use different inclusion dates and definitions.[^1]
5. **China dependence is not merely a module-price story.** USITC reports China accounted for 93.2% of global polysilicon production, 96.6% of wafers, 92.3% of cells, and 86.4% of modules in 2024. IEA separately estimates China holds about 85% of global PV manufacturing capacity and about 95% of wafer capacity.[^2] Even when final module imports arrive from Southeast Asia, upstream inputs can still originate in China.
6. **Demand is large enough that capacity alone is misleading.** EIA reports developers planned 43.4 GW of utility-scale solar additions in 2026; SEIA's Q3 2026 public report expects roughly 44 GW of annual additions through 2031.[^3] A supply test therefore needs an annual demand denominator and utilization/yield assumptions, not just cumulative factory announcements.
7. **The hardest facts remain commercially opaque.** There is no permissively licensed, current national dataset for actual factory throughput, tier-two supplier origin, purchase volumes by module brand, or the country of melt/refining for every material. The website should expose these as unknowns rather than replace them with announcements or modeled assumptions.

## Scope and reference installation

The recommended first release follows a **100 MWdc U.S. utility-scale crystalline-silicon project with single-axis tracking and a central inverter**. This matches NREL's Q1 2025 public benchmark model, which includes quantities, cost categories, and assumed origin for modules, structural balance of system, and electrical balance of system.[^4]

The tracked chain is:

```text
mined/extracted material
  → refined or processed material
  → solar-grade feedstock
  → wafer / cell / component
  → module and equipment assembly
  → direct U.S. import or domestic shipment
  → installed U.S. project
```

The primary branch is crystalline silicon. Cadmium-telluride (CdTe) should appear as a comparison branch because its material and manufacturing chain differs substantially and because integrated U.S. production can change the dependency story. Batteries, construction labor, land, permitting, project finance, and grid operation are outside the first release. Transformers and the solar plant's collection/interconnection equipment are in scope; bulk transmission expansion is not.

## Measurement model

For every node in the chain, preserve these concepts as separate fields:

| Measure | Meaning | Typical denominator | What it does not prove |
|---|---|---|---|
| Domestic nameplate capacity | Maximum rated annual output of operating factories | GW/year, tonnes/year, units/year | Actual output, utilization, yields, or domestic inputs |
| Domestic production | Output produced during a period | GW, tonnes, units | That the output was sold into U.S. solar projects |
| Apparent consumption | Production + imports − exports, sometimes adjusted for stocks | Tonnes/year or value/year | Solar-specific use when the commodity has many end uses |
| Direct import origin | Country from which a classified product enters the United States | Quantity/value by HTS code | Origin of upstream feedstocks inside that product |
| Global concentration | Country/region share of production or capacity | Percent of global total | Supplier substitutability or U.S. purchasing behavior |
| Modeled material demand | Engineering quantity × annual deployment | Tonnes/GW or units/GW | Observed procurement or supplier origin |
| Risk indicator | Concentration, net import reliance, forced-labor listing, or single-source exposure | Index/category | Certainty that supply will be disrupted |

The site should calculate stage-level indicators, not one opaque score:

- **Capacity coverage:** domestic operating nameplate capacity ÷ annual U.S. installation demand.
- **Observed supply coverage:** domestic production or shipments ÷ annual U.S. installation demand, only where production data exist.
- **Direct foreign share:** imports ÷ apparent U.S. supply for a sufficiently specific product code.
- **Country concentration:** top-country share and Herfindahl-Hirschman Index from country production or import shares.
- **Evidence quality:** observed, reported, modeled, announced, or unknown; with source date and definition attached.

Do not add capacities expressed in incompatible units. Polysilicon tonnes, wafer GW, inverter GWac, module GWdc, and transformer MVA require explicit conversion assumptions, manufacturing yields, and DC/AC ratios.

## Stage-by-stage audit

### 1. Deployment and the demand denominator

**What must be measured:** annual U.S. installations by segment; operating capacity; planned additions; technology, mounting, inverter, and DC/AC characteristics; future scenarios.

**Best open sources**

- **EIA-860 and EIA-860M** provide public-domain generator-level operating and planned utility-scale capacity. EIA-861M adds state-level small-scale PV estimates. These are the most reproducible official demand series.[^5]
- **Berkeley Lab Utility-Scale Solar 2025** is CC-licensed and contains non-confidential plant-level data for 1,760 projects installed through 2024, including capacity, technology, tracking, costs, performance, and interconnection-queue analysis.[^6]
- **EIA Annual Energy Outlook 2026** supplies public-domain scenario tables through 2050. EIA correctly describes these as modeled cases, not predictions.[^7]

**What this answers:** how many GWdc of equipment the United States needs each year; the mix of fixed-tilt and tracking; historical module technology; plausible future ranges.

**What remains missing:** a public national record of each project's module, inverter, tracker, transformer, and cable vendor and its tiered country of origin. Interconnection queues also overstate likely construction and should not be treated as demand commitments.

### 2. Quartz, silicon metal, and polysilicon

**Process:** high-purity quartz or silica is reduced to metallurgical-grade silicon; it is chemically purified into solar-grade polysilicon; polysilicon is crystallized into ingots.

**Best open sources**

- **USGS Mineral Commodity Summaries (MCS)** provides annual U.S. production, trade, apparent consumption, price, recycling, net import reliance, leading import sources, and global country production/reserves for silicon and more than 90 commodities. Its underlying data release is public domain. Some U.S. silicon and polysilicon figures are withheld to protect company data.[^8]
- **USGS U.S. mines, smelters, refineries, and recycling facilities** adds geospatial facilities for more than 60 commodities. The **Global Minerals Facilities** release adds production, capacity, and facility records across more than 150 countries under CC0.[^9]
- **DOE's Solar Manufacturing Map CSV** gives operating U.S. silicon-metal and polysilicon facility locations and stated nameplate capacity. The June 2026 file lists five silicon-metal sites and two polysilicon sites.[^1]
- **USITC's 2026 crystalline-silicon safeguard report** and **IEA supply-chain reports** provide global stage concentration and trade context.[^2]

**What this answers:** whether U.S. refining capacity exists; broad U.S. dependence on imported silicon; where global production is concentrated; and how domestic rated capacity compares with modeled PV demand.

**Limitations:** USGS commodity statistics cover all end uses, not just solar. DOE capacity is nameplate, and the map may omit plants or changes between updates. High-purity quartz and specific chemical intermediates such as hydrochloric acid, trichlorosilane, and graphite crucibles do not have a complete solar-specific open supply dataset.

### 3. Ingots and wafers

**Process:** polysilicon is melted and pulled/cast into mono- or multicrystalline ingots, squared, and sliced with diamond wire into wafers.

**Best open sources**

- **DOE's map CSV** is the primary open U.S. facility source. Its June 2026 active-manufacturing records total 2.5 GWdc/year of wafer nameplate capacity.[^1]
- **NIST Building Systems** contains public-domain unit-process models for U.S. single- and multi-Si wafer production, upstream silicon refining, energy, chemicals, and bridge processes.[^10]
- **IEA** and **USITC** provide country/region concentration. USITC reports China produced 96.6% of global wafers in 2024.[^2]
- **Census International Trade API / USITC DataWeb** can track directly imported wafers where HTS specificity is adequate.[^11]

**What this answers:** the scale of the domestic bottleneck and global concentration.

**Limitations:** public U.S. throughput and utilization are usually confidential; wafer trade codes and customs values can change; imported cells and modules embed wafers that disappear from wafer-level trade statistics.

### 4. Cells

**Process:** wafers are textured, doped, passivated/coated, metallized, fired, tested, and sorted into cells. Architecture matters: PERC, TOPCon, heterojunction, and back-contact cells use different processes and materials.

**Best open sources**

- **DOE's map CSV** lists active U.S. cell factories and nameplate capacity; June 2026 active records sum to about 13.6 GWdc/year.[^1]
- **USITC** reports U.S. producer capacity/utilization when disclosure permits and import quantities by source country under crystalline-cell tariff lines. It recorded 21.749 GW of cell imports in 2025.[^2]
- **NIST Building Systems** supplies public-domain unit processes for single- and multi-Si cells, including chemicals, silver metallization, and electricity inputs.[^10]
- **Census/USITC trade data** is the reproducible source for current direct origin, quantity, value, and tariff treatment.[^11]

**What this answers:** whether domestic cell nameplate could cover deployment, how much cell supply is imported directly, and which countries ship those cells.

**Limitations:** module imports embed cells and upstream countries are not visible in customs data. Factory architecture, utilization, yield, and long-term purchase commitments are inconsistently disclosed. Country of export is not always the same as origin of the wafer or polysilicon.

### 5. Module materials and module assembly

**Physical bill of materials:** cells, front and sometimes rear glass, aluminum frame, encapsulant (EVA or POE), backsheet or rear glass, copper/tinned ribbon, junction box, cables/connectors, edge seals/pottants, adhesives, and small quantities of silver and other metals.

**Best open sources**

- **NREL's Q1 2025 PV System Cost Benchmark Model** is the best public reference-system backbone. Its utility-scale input models a 600 W bifacial c-Si module assembled in the United States from imported cells and other components and assigns assumed source regions to glass, frame, encapsulant, junction box, ribbon, seals, and pottants.[^4]
- **NREL PV ICE** provides BSD-licensed time-series baseline CSVs for c-Si module mass, glass, silicon, silver, copper, aluminum frame, encapsulant, and backsheet, including manufacturing yield and circularity parameters.[^12]
- **NIST Building Systems** provides public-domain process models for laminates and panels and their material/energy inputs.[^10]
- **USGS MCS** supplies open production, trade, import-source, and net-import-reliance data for silver, aluminum/bauxite, copper, silicon, tin, lead, zinc, soda ash, and other inputs.[^8]
- **DOE's map CSV** supplies active U.S. module-assembly sites and nameplate. The June 2026 active records total about 64.2 GWdc/year.[^1]
- **USITC** recorded 33.269 GW of crystalline module imports in 2025 and reports country-level direct origin.[^2]

**What this answers:** which physical inputs a representative module needs; how material demand scales with installations; whether final assembly capacity exists; and how much finished-module supply arrives from abroad.

**Limitations:** PV ICE's baselines synthesize literature, including sources with their own terms; reuse of each derived baseline should be reviewed even though the repository is BSD-3-Clause. The NREL benchmark's origins are engineering assumptions, not observed procurement. Generic glass, polymers, aluminum, copper, and silver trade cannot be cleanly allocated to solar. There is no complete permissive dataset of U.S. solar-glass, encapsulant, backsheet, junction-box, ribbon, or connector production and utilization.

### 6. Trackers, racking, piles, and foundations

**Physical bill of materials:** driven steel piles, torque tubes, rails, bearings, fasteners, drive systems, actuators, dampers, controllers, foundations, and sometimes aluminum structural parts.

**Best open sources**

- **NREL's Q1 2025 benchmark** itemizes the structural balance of system for a single-axis tracker and distinguishes assumed domestic major steel components from imported dampers.[^4]
- **NIST Building Systems** includes seven residential mounting structures; these are valuable for component relationships but do not replace a current utility-scale tracker BOM.[^10]
- **USGS MCS and facility releases** cover iron and steel, aluminum, zinc, cement, and relevant processing locations.[^8][^9]
- **Census/USITC trade** can measure selected steel products, structures, motors, and controls, but the codes are rarely solar-specific.[^11]

**What this answers:** the quantity and type of structural inputs and broad domestic material availability.

**Limitations:** there is no open national tracker/racking factory-capacity dataset comparable to DOE's PV manufacturing map. Broad HTS codes mix solar equipment with other uses. Motors, bearings, controls, and fasteners can contain additional foreign tiers that the public data do not expose.

### 7. Inverters and power electronics

**Physical bill of materials:** semiconductor switches, printed circuit boards, capacitors, inductors/chokes, magnetics, filters, controls, cooling systems, fans/pumps, wiring, and an enclosure. Utility projects may use central or string inverters.

**Best open sources**

- **NREL's Q1 2025 benchmark** models a 4 MW central inverter imported from Europe and divides cost among switching, filtering, controls, cooling, enclosure, and other components.[^4]
- **NIST Building Systems' 2025 update** is unusually valuable: its public-domain LCI includes four string inverters, a microinverter, a string optimizer, and other electrical equipment, with components such as PCBs, capacitors, inductors, copper wire, and enclosures.[^10]
- **Census/USITC trade** can track static converters and selected electronic components, subject to classification specificity.[^11]
- **Commerce's Quadrennial Supply Chain Review** and DOE semiconductor/grid reports can provide public-domain context on semiconductor and electronics concentration, but not observed solar-inverter purchasing.[^13]

**What this answers:** what is inside an inverter; which component classes create tier-two dependence; and direct import patterns for inverters or static converters where codes allow.

**Limitations:** no permissive current dataset links U.S. installed inverter models to manufacturing sites and upstream semiconductor fabs. Static-converter codes mix solar with non-solar uses. NIST's models are structural/LCA representations, not a live supplier database.

### 8. Electrical balance of system and interconnection equipment

**Physical bill of materials:** DC and AC conductors, combiner boxes, switches, circuit breakers, grounding, collection-system equipment, medium-voltage transformers, substation equipment, and a short generation-tie line.

**Best open sources**

- **NREL's Q1 2025 benchmark** provides quantities and assumed origin for conductors, combiner boxes, switches, breakers, transformers, substation equipment, and transmission.[^4]
- **DOE's Electric Grid Supply Chain report** maps large-power-transformer inputs, including grain-oriented electrical steel, copper, insulating material, oil, bushings, and other components.[^14]
- **EIA-860** supplies plant/interconnection voltage and generator attributes useful for sizing classes.[^5]
- **USGS** covers copper, aluminum, iron/steel, and zinc; **Census/USITC** covers insulated cable, transformers, switchgear, and related imports.[^8][^11]

**What this answers:** the equipment required between modules and the grid; broad material exposure; and direct import origins for some equipment categories.

**Limitations:** transformer ratings are not interchangeable with PV GW. Public capacity, backlog, lead-time, utilization, and tier-two origin data are incomplete. HTS categories are often broader than solar and can obscure the source of cores, windings, and bushings.

### 9. CdTe comparison branch

**Process:** glass preparation and transparent conductive oxide deposition; cadmium sulfide/telluride semiconductor layers; contacts; lamination; module assembly; recycling. The vertically integrated chain differs from c-Si and is not well described by wafer/cell statistics.

**Best open sources**

- **DOE's manufacturing map** identifies active domestic thin-film facilities and rated module capacity where disclosed.[^1]
- **USGS MCS** provides tellurium and cadmium production, trade, import sources, recycling, and net-import-reliance context.[^8]
- **USGS global and U.S. facility releases** identify relevant mines, smelters, and refineries.[^9]
- **DOE's Solar Photovoltaics Supply Chain Review** provides a public-domain process map for c-Si and CdTe.[^15]
- **Census/USITC trade data** can separate some thin-film modules from crystalline products, but upstream cadmium/tellurium embedded in modules remains invisible.[^11]

**What this answers:** how a non-silicon route changes the critical stages and materials; where domestic integration exists; and where tellurium/cadmium refining is concentrated.

**Limitations:** PV ICE does not yet ship a CdTe baseline, and no equally detailed, clearly permissive current CdTe BOM was found. Company sustainability reports and environmental product declarations can fill selected values as cited evidence, but their reuse terms and system boundaries vary and should not be bulk-ingested without review.

### 10. Cross-cutting trade, ownership, policy, and labor-risk evidence

- **Census International Trade API / USITC DataWeb** is the preferred direct-origin layer. Store HTS edition and query parameters because codes and units change.[^11]
- **USITC safeguard investigations** add industry questionnaires, capacity, utilization, shipments, and country import tables, though business-confidential values are redacted.[^2]
- **DOL's List of Goods Produced by Child Labor or Forced Labor** and **ImportWatch** provide public federal risk indicators. The list covers polysilicon, ingots, wafers, cells, modules, and several upstream inputs associated with China. This is a screening signal, not proof about a specific shipment.[^16]
- **DHS's UFLPA Entity List** supplies named entities and products for enforcement screening.[^17]
- **The Big Green Machine** publishes a monthly, CC BY 4.0 spreadsheet of U.S. clean-manufacturing announcements, status, investment, and jobs. It is useful for an event log after filtering to solar, but is not a technical capacity census.[^18]
- **Clean Investment Monitor** publishes CC BY 4.0 methods and data products for realized and announced clean-manufacturing investment. Facility-level access may require its ClimateDeck interface, so access should be tested before pipeline design.[^19]

Country of corporate headquarters, factory location, customs origin, and upstream material origin are different variables and should never be collapsed into “country.”

## Recommended open-data stack

### Priority 0: sufficient for a credible first public release

1. NREL Q1 2025 benchmark as the reference-installation component graph.
2. DOE Solar Manufacturing Map CSV for domestic PV factory nameplate capacity.
3. EIA-860/860M/861M for historical and current deployment demand.
4. Census trade API / USITC DataWeb for direct import origin by stable HTS crosswalk.
5. USGS MCS plus U.S./global facility releases for raw materials and processing.
6. NIST Building Systems for process and component relationships, including inverters.
7. IEA and USITC reports for global stage concentration.

### Priority 1: improves quantities, history, and corroboration

8. PV ICE for time-varying c-Si module material intensity and yields.
9. Berkeley Lab Utility-Scale Solar for project technology and historical deployment detail.
10. EIA AEO 2026 for future demand cases.
11. Big Green Machine for announcement/closure history.
12. DOL and DHS data for transparent labor-risk screening.

### Reference-only or blocked pending license/access review

The following sources can help discover facilities or corroborate totals, but should not be copied into the product dataset under current terms:

| Source | Why it is attractive | Why it is not an ingestion source yet |
|---|---|---|
| BlueGreen Alliance U.S. Solar Manufacturing Supply Chain Analysis | Public ArcGIS layer; facility status, product, and capacity | No clear license found for the downloadable facility layer; request permission first |
| SEIA Solar & Storage Supply Chain Dashboard | Current industry capacity and announcements | Full data is members-only; public aggregates can differ from downloadable data |
| Sinovoltaics North America Supply Chain Map | Frequently refreshed factory map | Form-gated PDF; no clear machine-data or reuse license |
| Solar Power World manufacturer lists | Current editorial directory | Site states content may not be reproduced without permission |
| ACP America Builds Power | Broad clean-energy factory map | No clear bulk download or open-data license found |
| ITRPV reports | Strong technology-roadmap and material-intensity inputs | Copyright/reuse constraints; use as a cited underlying source, not republished data |
| Wood Mackenzie, Ecoinvent | Detailed market and LCA data | Proprietary |

## What the open sources can answer now

With transparent transformations and caveats, they can answer:

- What components and upstream materials are required for a representative c-Si installation?
- Which stages have operating U.S. factories, where are they, and what is their stated nameplate capacity?
- How does that nameplate compare with current annual installations and public future scenarios?
- How many finished crystalline modules and cells are imported directly, and from which countries?
- Which countries dominate global polysilicon, wafer, cell, and module production?
- For major minerals, what are U.S. production, trade, net import reliance, import sources, and global production/reserves?
- Which dependencies move or disappear under a CdTe rather than c-Si branch?
- Which stages carry documented forced-labor or trade-enforcement risk indicators?

They cannot yet answer with national precision:

- What fraction of modules installed in a given year were actually made at U.S. factories?
- What fraction of a U.S.-assembled module's economic value or physical mass is domestic?
- Where every cell's wafer, polysilicon, quartz, silver paste, glass, polymer, and electronic component originated?
- Actual utilization and yields at most individual factories.
- Which inverter semiconductor fab, tracker motor supplier, transformer core mill, or cable smelter supplied a specific project.
- How quickly imports could be substituted after a disruption.

Those are not reasons to invent estimates. They are valuable findings the interface should make visible.

## Data integration design

The eventual data model should preserve provenance at the observation level:

```text
node
  id, label, technology_branch, stage, unit

edge
  from_node, to_node, quantity_per_reference_system,
  quantity_basis, model_year, source_id

facility
  facility_id, company, site, country, coordinates,
  product_node, status, nameplate_capacity, capacity_unit,
  announcement_date, operation_date, source_id

observation
  node_id, geography, period, measure,
  value, unit, status, evidence_type,
  definition, source_id, retrieved_at

trade_observation
  hts_edition, hts_code, product_node, origin_country,
  period, quantity, quantity_unit, customs_value,
  mapping_confidence, source_id
```

Every displayed value should retain source URL, publisher, vintage, retrieval date, license, unit, definition, transformation, and uncertainty/status. Keep reported values separate from calculated values. Archive upstream files by checksum only when their licenses permit redistribution; otherwise store query recipes and citations.

## Immediate research and engineering backlog

1. Build and version an HTS crosswalk for crystalline cells/modules, thin-film modules, static converters, transformers, switchgear, cable, tracker components, and key materials. Record effective dates and units.
2. Download the full NIST Building Systems JSON-LD release and extract its component/process graph; compare it with NREL's utility-scale benchmark.
3. Create a reference BOM table with `quantity`, `unit`, `basis`, `technology`, `assumed_origin`, and `evidence_type`. Treat NREL origins as modeled assumptions.
4. Reconcile DOE facility records against BlueGreen Alliance and public company filings. Publish discrepancies rather than silently choosing a source.
5. Develop conversion scenarios from annual GWdc demand to polysilicon, glass, aluminum, copper, and silver demand using PV ICE, with low/base/high yield assumptions.
6. Separate operating, under-construction, and announced factories. Never include announcements in current capacity coverage.
7. Request explicit reuse permission for the BlueGreen Alliance facility layer.
8. Find or construct an openly licensed CdTe BOM from federal reports, public-domain LCI work, or permissioned company data.
9. Quantify uncertainty caused by confidential production/utilization data and broad commodity/HTS classifications.
10. Add automated link, vintage, schema, and license checks before any dataset refresh is published.

## Source governance

- **Allowed by default:** U.S. federal public-domain works; CC0; CC BY 4.0; permissively licensed code/data repositories whose data-file scope is clear.
- **Review required:** pages saying “free,” “public,” or “downloadable” without an explicit reuse license; mixed-source compilations; federal-lab works containing third-party material; API terms rather than an open-data license.
- **Do not ingest:** members-only, form-gated, all-rights-reserved, or proprietary datasets without written permission. They may be cited as contextual publications within fair-use limits.
- **Attribution:** attribute even public-domain federal data as a research norm. For CC BY sources, retain creator, title, URL, license, and indication of transformations.
- **Dates:** distinguish observation period, publication date, dataset update date, announcement date, and retrieval date.

## Sources

[^1]: U.S. Department of Energy, “U.S. Domestic Solar Photovoltaic Manufacturing Map Data,” updated June 15, 2026, [landing page](https://www.energy.gov/cmei/systems/articles/us-domestic-solar-photovoltaic-manufacturing-map-data) and [CSV](https://www.energy.gov/sites/default/files/2026-06/us_pv_mfg_map_20260615.csv). U.S. government work; DOE states government information on its sites is public domain, subject to identified third-party exceptions ([web policies](https://www.energy.gov/web-policies)).
[^2]: U.S. International Trade Commission, *Crystalline Silicon Photovoltaic Cells, Whether or Not Partially or Fully Assembled into Other Products*, Publication 5773, August 2026, [PDF](https://www.usitc.gov/publications/safeguards/pub5773.pdf), U.S. government work/public domain; International Energy Agency, *Solar PV Global Supply Chains*, July 2022, [report](https://www.iea.org/reports/solar-pv-global-supply-chains), CC BY 4.0; IEA, *Energy Technology Perspectives 2026: Supply Chain Risks and Industrial Competitiveness*, 2026, [chapter](https://www.iea.org/reports/energy-technology-perspectives-2026/supply-chain-risks-and-industrial-competitiveness), CC BY 4.0.
[^3]: U.S. Energy Information Administration, “Solar, battery storage to lead new U.S. generating capacity additions in 2026,” 2026, [Today in Energy](https://www.eia.gov/todayinenergy/detail.php?id=67205), public domain; Solar Energy Industries Association/Wood Mackenzie, *U.S. Solar Market Insight Q3 2026*, September 10, 2026, [public summary](https://seia.org/research-resources/solar-market-insight-report-q3-2026/), copyrighted summary/reference only.
[^4]: National Laboratory of the Rockies, *Q1 2025 PV System Cost Benchmark Model*, 2026, [OEDI record](https://data.openei.org/submissions/8599), CC BY 4.0; U.S. Department of Energy, “Solar Photovoltaic System Cost Benchmarks,” [method page](https://www.energy.gov/cmei/systems/solar-photovoltaic-system-cost-benchmarks), U.S. government work/public domain.
[^5]: U.S. Energy Information Administration, [Form EIA-860](https://www.eia.gov/electricity/data/eia860/), [Form EIA-860M](https://www.eia.gov/electricity/data/eia860m/), and [Form EIA-861M](https://www.eia.gov/electricity/data/eia861m/), updated on their respective schedules. Public domain under EIA's [copyright and reuse policy](https://www.eia.gov/about/copyrights_reuse.php).
[^6]: Lawrence Berkeley National Laboratory, *Utility-Scale Solar, 2025 Edition*, September 25, 2025, [OEDI record and public workbook](https://data.openei.org/submissions/8541), CC BY 4.0.
[^7]: U.S. Energy Information Administration, *Annual Energy Outlook 2026*, [reference-case tables](https://www.eia.gov/outlooks/aeo/tables_ref.php) and [side-case spreadsheets](https://www.eia.gov/outlooks/aeo/tables_side_xls.php), public domain.
[^8]: U.S. Geological Survey, *Mineral Commodity Summaries 2026*, January 2026, [publication](https://pubs.usgs.gov/publication/mcs2026) and [data release](https://doi.org/10.5066/P1WKQ63T), U.S. government work/public domain. See USGS [data licensing](https://www.usgs.gov/data-management/data-licensing).
[^9]: U.S. Geological Survey, *Mines, Smelters, Refineries, and Recycling Facilities in the United States*, 2026, [data page](https://www.usgs.gov/data/mines-smelters-refineries-and-recycling-facilities-united-states), U.S. government data/public domain; USGS, *2024 Minerals Yearbook Global Production and Facility Data*, [data page](https://www.usgs.gov/data/2024-minerals-yearbook-volume-iii-area-reports-international-country-reports-global-production), CC0 1.0.
[^10]: National Institute of Standards and Technology, *Building Systems (BSYS), version 1.2026-06.0*, 2026, [Federal LCA Commons repository](https://www.lcacommons.gov/lca-collaboration/NIST/Building_Systems/datasets/Sources/NIST%20Sources). NIST employee work is not subject to U.S. copyright; attribution and acceptance of the repository's appropriate-use terms are required. New Federal LCA Commons submissions are placed under CC0 1.0 ([submission guidance](https://flcac-admin.github.io/FLCAC-docs/datasubmissionhandbook/)).
[^11]: U.S. Census Bureau, [International Trade API](https://www.census.gov/data/developers/data-sets/international-trade.html) and [API terms of service](https://www.census.gov/data/developers/about/terms-of-service.html); U.S. International Trade Commission, [DataWeb](https://dataweb.usitc.gov/). Public federal data subject to stated API/access terms and attribution requirements.
[^12]: National Laboratory of the Rockies, *PV ICE*, current release and baseline files, [GitHub repository](https://github.com/NatLabRockies/PV_ICE) and [data documentation](https://pv-ice.readthedocs.io/en/latest/data.html), BSD-3-Clause repository license. Verify the scope and provenance of derived baseline data before redistribution.
[^13]: U.S. Department of Commerce, *2021–2024 Quadrennial Supply Chain Review*, January 2025, [PDF](https://www.trade.gov/sites/default/files/2025-01/20212024-Quadrennial-Supply-Chain-Review.pdf), U.S. government work/public domain.
[^14]: U.S. Department of Energy, *Electric Grid Supply Chain Review*, February 2022, [PDF](https://www.energy.gov/sites/default/files/2022-02/Electric%20Grid%20Supply%20Chain%20Report%20-%20Final_0.pdf), U.S. government work/public domain.
[^15]: U.S. Department of Energy, *Solar Photovoltaics Supply Chain Review*, February 2022, [landing page](https://www.energy.gov/cmei/systems/solar-photovoltaics-supply-chain-review-report) and [PDF](https://www.energy.gov/sites/default/files/2022-02/Solar%20Energy%20Supply%20Chain%20Report%20-%20Final_0.pdf), U.S. government work/public domain.
[^16]: U.S. Department of Labor, *List of Goods Produced by Child Labor or Forced Labor*, current edition, [dataset page](https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods), and [ImportWatch](https://www.dol.gov/agencies/ilab/importwatch), U.S. government works/public domain; verify terms of embedded dashboard exports.
[^17]: U.S. Department of Homeland Security, [Uyghur Forced Labor Prevention Act resources and Entity List](https://www.dhs.gov/uflpa), current edition, U.S. government work/public domain.
[^18]: Atlas Public Policy, *The Big Green Machine Database*, updated monthly, [access page](https://www.the-big-green-machine.com/access-database), CC BY 4.0.
[^19]: Rhodium Group and MIT Center for Energy and Environmental Policy Research, *Clean Investment Monitor*, updated quarterly, [project](https://www.cleaninvestmentmonitor.org/us), CC BY 4.0 for published data/materials as stated by the project; confirm ClimateDeck export access before automating ingestion.
