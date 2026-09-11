import { z } from "zod";

export const EvidenceTypeSchema = z.enum([
  "observed",
  "nameplate",
  "modeled",
  "announced",
  "unknown",
]);

export const TechnologySchema = z.enum(["shared", "c-si", "cdte"]);

export const StageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().nonnegative(),
  technology: TechnologySchema,
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(1),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

const nullableNumber = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().nonnegative().nullable(),
);

export const ObservationSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    stageId: z.string(),
    sourceId: z.string(),
    metric: z.string().min(1),
    value: nullableNumber,
    displayValue: z.string().min(1),
    unit: z.string(),
    geography: z.string().min(1),
    period: z.string().min(1),
    evidenceType: EvidenceTypeSchema,
    definition: z.string().min(1),
    limitation: z.string().min(1),
    calculation: z.string().nullable(),
  })
  .superRefine((observation, context) => {
    if (observation.evidenceType === "unknown" && observation.value !== null) {
      context.addIssue({
        code: "custom",
        message: "Unknown observations must use a null value",
        path: ["value"],
      });
    }
    if (observation.evidenceType !== "unknown" && observation.value === null) {
      context.addIssue({
        code: "custom",
        message: "Quantitative evidence requires a value",
        path: ["value"],
      });
    }
  });

export const SourceSchema = z.object({
  source_id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.url(),
  license: z.string().min(1),
  license_url: z.union([z.url(), z.literal("")]),
  access: z.string().min(1),
  formats: z.string().min(1),
  geography: z.string().min(1),
  temporal_coverage: z.string().min(1),
  update_cadence: z.string().min(1),
  value_chain_stages: z.string().min(1),
  key_fields: z.string().min(1),
  questions_supported: z.string().min(1),
  known_limitations: z.string().min(1),
  ingest_priority: z.string().min(1),
  status: z.string().min(1),
  last_verified: z.string().min(1),
});

export const QuestionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stageId: z.string(),
  title: z.string().min(1),
  missingMeasure: z.string().min(1),
  usefulSourceWouldInclude: z.array(z.string()).min(1),
  issueLabel: z.literal("data-source"),
});

export const ReferenceComponentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  quantity: z.string().min(1),
  origin: z.string().min(1),
});

export const ReferenceSystemSchema = z.object({
  title: z.string().min(1),
  capacityMwDc: z.number().positive(),
  configuration: z.string().min(1),
  inverterType: z.string().min(1),
  benchmarkYear: z.number().int(),
  sourceId: z.string().min(1),
  components: z.array(ReferenceComponentSchema).min(1),
});

export const FacilityStatusSchema = z.enum([
  "active",
  "announced",
  "proposed",
  "inactive",
  "unknown",
]);

export const FacilityMeasureTypeSchema = z.enum(
  ["nameplate-capacity", "production-output"],
  "Capacity records must use nameplate-capacity; observed output must use production-output",
);

export const FacilitySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    sourceId: z.string().min(1),
    name: z.string().min(1),
    company: z.string(),
    stageId: z.string().min(1),
    technology: TechnologySchema,
    facilityType: z.string().min(1),
    city: z.string(),
    state: z.string(),
    countryCode: z.string().regex(/^[A-Z]{3}$/),
    latitude: z.number().min(-90, "Latitude must be at least -90").max(90),
    longitude: z.number().min(-180, "Longitude must be at least -180").max(180),
    status: FacilityStatusSchema,
    measureType: FacilityMeasureTypeSchema,
    measureValue: nullableNumber,
    measureUnit: z.string(),
    measurePeriod: z.string().min(1),
    sourceUrl: z.url(),
    limitation: z.string().min(1),
  })
  .superRefine((facility, context) => {
    if (facility.measureValue !== null && !facility.measureUnit.trim()) {
      context.addIssue({
        code: "custom",
        message: "A numeric facility measure requires a unit",
        path: ["measureUnit"],
      });
    }
  });

const aggregateCountryNames = new Set([
  "rest of world",
  "rest of asia",
  "other",
  "unknown",
]);

export const SupplyCountrySchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{3}$/),
  countryName: z.string().min(1),
  value: nullableNumber,
  originType: z.enum(["direct", "upstream"]),
});

export const SupplyMixSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    stageId: z.string().min(1),
    product: z.string().min(1),
    geography: z.literal("US market"),
    period: z.string().min(1),
    measure: z.enum(["actual-supply", "imports"]),
    unit: z.string().min(1),
    denominatorValue: z.number().positive(),
    sourceId: z.string().min(1),
    completeness: z.enum(["complete", "partial"]),
    limitation: z.string().min(1),
    countries: z.array(SupplyCountrySchema),
    unknownOriginValue: nullableNumber,
  })
  .superRefine((mix, context) => {
    const originTypes = new Set(mix.countries.map((item) => item.originType));
    if (originTypes.size > 1) {
      context.addIssue({
        code: "custom",
        message: "A supply mix cannot combine direct and upstream origins",
        path: ["countries"],
      });
    }
    for (const [index, country] of mix.countries.entries()) {
      if (aggregateCountryNames.has(country.countryName.trim().toLowerCase())) {
        context.addIssue({
          code: "custom",
          message: "Aggregate regions are not countries",
          path: ["countries", index, "countryName"],
        });
      }
    }
    const knownTotal = mix.countries.reduce(
      (total, country) => total + (country.value ?? 0),
      0,
    );
    const tolerance = Math.max(0.001, mix.denominatorValue * 0.001);
    if (knownTotal > mix.denominatorValue + tolerance) {
      context.addIssue({
        code: "custom",
        message: "Known country values exceed the supply-mix denominator",
        path: ["countries"],
      });
    }
  });

export const ResolvedObservationSchema = ObservationSchema.and(
  z.object({ source: SourceSchema }),
);
export const ResolvedFacilitySchema = FacilitySchema.and(
  z.object({ source: SourceSchema }),
);
export const ResolvedSupplyMixSchema = SupplyMixSchema.and(
  z.object({ source: SourceSchema }),
);

export const SiteDataSchema = z.object({
  generatedAt: z.string().min(1),
  sources: z.array(SourceSchema),
  stages: z.array(StageSchema),
  observations: z.array(ResolvedObservationSchema),
  questions: z.array(QuestionSchema),
  facilities: z.array(ResolvedFacilitySchema),
  supplyMixes: z.array(ResolvedSupplyMixSchema),
  referenceSystem: ReferenceSystemSchema.and(
    z.object({ source: SourceSchema }),
  ),
});

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type ReferenceSystem = z.infer<typeof ReferenceSystemSchema>;
export type ResolvedObservation = z.infer<typeof ResolvedObservationSchema>;
export type Facility = z.infer<typeof FacilitySchema>;
export type ResolvedFacility = z.infer<typeof ResolvedFacilitySchema>;
export type SupplyMix = z.infer<typeof SupplyMixSchema>;
export type ResolvedSupplyMix = z.infer<typeof ResolvedSupplyMixSchema>;
export type SiteData = z.infer<typeof SiteDataSchema>;
