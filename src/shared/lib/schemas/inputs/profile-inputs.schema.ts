import z from "zod";
import { profileSchema } from "../profiles.schema";

export const updateProfileSchema = profileSchema
    .pick({
        first_name: true,
        last_name: true,
        phone: true,
        country: true,
        city: true,
        preferred_language: true,
        sex: true,
    })
    .partial();

export type UpdateProfileInput =
    z.infer<typeof updateProfileSchema>;