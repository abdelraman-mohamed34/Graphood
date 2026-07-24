import { z } from "zod";
import { locales, sex } from "../../../../public/data";

export const profileSchema = z.object({

    // auth.users.id
    id: z.string().uuid("Invalid Profile ID"),

    first_name: z
        .string()
        .min(2, "First name must be at least 2 characters"),

    last_name: z
        .string()
        .min(2, "Last name must be at least 2 characters"),

    phone: z
        .string()
        .min(10, "Phone number is too short")
        .optional(),

    email: z.email(),

    avatar_url: z
        .string()
        .url("Invalid avatar URL")
        .nullable()
        .optional(),

    country: z
        .string()
        .optional(),

    city: z
        .string()
        .optional(),

    preferred_language: z
        .enum(locales)
        .default("ar"),

    is_verified: z
        .boolean()
        .default(false),

    created_at: z.coerce.date(),

    sex: z.enum(sex),

    updated_at: z.coerce.date().optional(),
});

export type Profile = z.infer<typeof profileSchema>;