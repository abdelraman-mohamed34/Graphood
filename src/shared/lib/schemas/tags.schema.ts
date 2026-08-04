import { z } from "zod";

export const tagSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().min(1),
    name_en: z.string().min(1),
    name_ar: z.string().min(1),
    created_at: z.string().optional(),
});

export type Tag = z.infer<typeof tagSchema>;

export const getCreateTagInputSchema = (t?: (key: string) => string) =>
    z.object({
        slug: z
            .string()
            .min(2, t ? t("validation.slug_min") : "Slug must be at least 2 characters")
            .max(50, t ? t("validation.slug_max") : "Slug must be at most 50 characters")
            .regex(
                /^[a-z0-9-]+$/,
                t ? t("validation.slug_format") : "Slug must be lowercase and hyphenated"
            ),
        name_en: z
            .string()
            .min(2, t ? t("validation.name_en_required") : "English name is required"),
        name_ar: z
            .string()
            .min(2, t ? t("validation.name_ar_required") : "Arabic name is required"),
    });

export const createTagInputSchema = getCreateTagInputSchema();
export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const marketplaceFilterSchema = z.object({
    tag: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(12),
});

export type MarketplaceFilterInput = z.infer<typeof marketplaceFilterSchema>;