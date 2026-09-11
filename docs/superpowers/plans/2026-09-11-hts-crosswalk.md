# HTS Crosswalk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a validated, versioned HTS crosswalk for direct U.S. crystalline-silicon cell and module imports.

**Architecture:** Store reviewed classifications in `data/hts-crosswalk.json`, validate structural and temporal rules in a focused TypeScript schema, and make canonical data compilation verify crosswalk references without adding the artifact to the runtime site payload.

**Tech Stack:** TypeScript 6, Zod 4, Vitest, JSON canonical data, existing Node data compiler.

## Global Constraints

- Initial coverage is HTS `8541420010` for crystalline-silicon cells and `8541430010` for crystalline-silicon modules, effective 2022-01-27.
- Use U.S. imports for consumption by individual country and customs value as the common aggregation measure.
- Preserve quantity and unit fields only as supporting measures; never combine unlike units.
- All derived origins are direct import origin, never embedded upstream origin.
- Do not fetch trade data or populate `data/supply-mixes.json` in this change.

---

### Task 1: Crosswalk schema and approved artifact

**Files:**
- Create: `src/data/htsCrosswalk.ts`
- Create: `src/data/htsCrosswalk.test.ts`
- Create: `data/hts-crosswalk.json`

**Interfaces:**
- Produces: `HtsCrosswalkSchema`, `HtsCrosswalk`, and `HtsCrosswalkEntry`.
- Consumes: Zod only.

- [ ] **Step 1: Write failing schema tests**

Test a complete cells/modules fixture and assert rejection of a non-ten-digit code, a reversed effective period, and duplicate stage/code/start-date classifications.

- [ ] **Step 2: Run the focused tests and verify RED**

Run `corepack yarn test src/data/htsCrosswalk.test.ts`; expect failure because the schema module does not exist.

- [ ] **Step 3: Implement the schema and artifact**

Define strict schemas for metadata, query semantics, classification scope, effective periods, provenance, and domain refinements. Add the two approved current classifications with direct-origin limitations and official source URLs.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run `corepack yarn test src/data/htsCrosswalk.test.ts`; expect all focused tests to pass.

### Task 2: Compiler integration and reference validation

**Files:**
- Modify: `scripts/compile-data.ts`
- Modify: `scripts/compile-data.test.ts`

**Interfaces:**
- Consumes: `HtsCrosswalkSchema` and canonical `data/hts-crosswalk.json`.
- Produces: compilation failure for unknown crosswalk stage/source references while leaving `SiteData` unchanged.

- [ ] **Step 1: Write failing compiler tests**

Extend the fixture writer with an HTS crosswalk and assert that unknown stage and source IDs are rejected.

- [ ] **Step 2: Run compiler tests and verify RED**

Run `corepack yarn test scripts/compile-data.test.ts`; expect the new invalid-reference cases to pass incorrectly until compiler validation is implemented.

- [ ] **Step 3: Validate the crosswalk during compilation**

Parse `data/hts-crosswalk.json`, verify every entry's stage and classification/validation source IDs, and do not add it to the returned runtime payload.

- [ ] **Step 4: Run compiler tests and verify GREEN**

Run `corepack yarn test scripts/compile-data.test.ts`; expect all compiler tests to pass.

### Task 3: Maintenance documentation and repository verification

**Files:**
- Modify: `README.md`
- Modify: `docs/data-maintenance.md`

**Interfaces:**
- Documents: ownership, update procedure, Census query contract, direct-origin limitation, and importer handoff.

- [ ] **Step 1: Document the canonical artifact**

Add the crosswalk to the README data workflow and add a maintenance section with exact classification scope, annual review procedure, and downstream aggregation rules.

- [ ] **Step 2: Run complete verification**

Run `corepack yarn verify`; require formatting, lint, type checking, all tests, content validation, and production build to pass.

- [ ] **Step 3: Inspect the final diff**

Run `git diff --check` and confirm the runtime `SiteData` shape and `data/supply-mixes.json` are unchanged.
