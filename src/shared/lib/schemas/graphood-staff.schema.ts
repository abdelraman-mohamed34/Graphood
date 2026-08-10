import { z } from "zod";

export const systemRoleEnum = z.enum(["SUPER_ADMIN", "SUPPORT_AGENT"], {
    error: "validation.roleInvalid",
});

export const platformStaffSchema = z.object({
    id: z.uuid({ error: "validation.staffIdInvalid" }),
    profileId: z.uuid({ error: "validation.profileIdInvalid" }),
    email: z.email({ error: "validation.emailInvalid" }).nullable(),
    role: systemRoleEnum,
    createdAt: z.iso.datetime({ offset: true }).nullable(),
});

export const createPlatformStaffSchema = z
    .object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .pipe(z.email({ error: "validation.emailInvalid" }))
            .optional(),
        profileId: z.uuid({ error: "validation.profileIdInvalid" }).optional(),
        role: systemRoleEnum,
    })
    .refine((input) => Boolean(input.email || input.profileId), {
        message: "validation.identifierRequired",
        path: ["email"],
    });

export const removePlatformStaffSchema = z.object({
    staffId: z.uuid({ error: "validation.staffIdInvalid" }),
});

export type SystemRole = z.infer<typeof systemRoleEnum>;
export type PlatformStaff = z.infer<typeof platformStaffSchema>;
export type CreatePlatformStaffInput = z.infer<typeof createPlatformStaffSchema>;
