import { z } from "zod";

export const systemRoleEnum = z.enum(["SUPER_ADMIN", "SUPPORT_AGENT"]);

export const platformStaffSchema = z.object({
    id: z.string().uuid(),
    profileId: z.string().uuid("invalid ID"),
    role: systemRoleEnum,
    createdAt: z.date().optional(),
});

export const createPlatformStaffSchema = platformStaffSchema.pick({
    profileId: true,
    role: true,
});

export type PlatformStaff = z.infer<typeof platformStaffSchema>;
export type CreatePlatformStaffInput = z.infer<typeof createPlatformStaffSchema>;