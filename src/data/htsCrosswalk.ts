import { z } from "zod";

const IsoDateSchema = z.iso.date();

export const HtsCrosswalkEntrySchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9-]+$/),
    stageId: z.string().regex(/^[a-z0-9-]+$/),
    technology: z.literal("c-si"),
    htsCode: z
      .string()
      .regex(/^\d{10}$/, "HTS statistical reporting number must be ten digits"),
    description: z.string().min(1),
    effectiveFrom: IsoDateSchema,
    effectiveTo: IsoDateSchema.nullable(),
    tradeFlow: z.literal("imports-for-consumption"),
    countryDimension: z.literal("individual-country"),
    valueField: z.literal("CON_VAL_MO"),
    quantityField: z.literal("CON_QY1_MO"),
    unitField: z.literal("UNIT_QY1"),
    preferredMeasure: z.literal("customs-value-usd"),
    originType: z.literal("direct"),
    includes: z.array(z.string().min(1)).min(1),
    excludes: z.array(z.string().min(1)).min(1),
    limitation: z.string().min(1),
    classificationSourceUrl: z.url(),
    validationSourceIds: z.array(z.string().min(1)).min(1),
  })
  .superRefine((entry, context) => {
    if (entry.effectiveTo && entry.effectiveTo <= entry.effectiveFrom) {
      context.addIssue({
        code: "custom",
        message: "Effective end must be later than effective start",
        path: ["effectiveTo"],
      });
    }
  });

export const HtsCrosswalkSchema = z
  .strictObject({
    version: z.string().regex(/^\d{4}\.\d+$/),
    lastVerified: IsoDateSchema,
    classificationSourceId: z.string().min(1),
    tradeDataSourceId: z.string().min(1),
    entries: z.array(HtsCrosswalkEntrySchema).min(1),
  })
  .superRefine((crosswalk, context) => {
    const ids = new Set<string>();
    const classifications = new Set<string>();
    for (const [index, entry] of crosswalk.entries.entries()) {
      if (ids.has(entry.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate entry id: ${entry.id}`,
          path: ["entries", index, "id"],
        });
      }
      ids.add(entry.id);

      const classification = `${entry.stageId}:${entry.htsCode}:${entry.effectiveFrom}`;
      if (classifications.has(classification)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate classification: ${classification}`,
          path: ["entries", index, "htsCode"],
        });
      }
      classifications.add(classification);
    }
  });

export type HtsCrosswalk = z.infer<typeof HtsCrosswalkSchema>;
export type HtsCrosswalkEntry = z.infer<typeof HtsCrosswalkEntrySchema>;
