const descriptiveMetadataKeys = [
    "email",
    "target_user_email",
    "profile_id",
    "system_name",
    "name",
] as const;

export interface AuditLogEntityLabel {
    label: string;
    fullValue: string;
    isFallback: boolean;
}

export function getAuditLogEntityLabel(
    metadata: unknown,
    entityId: string | null | undefined,
): AuditLogEntityLabel {
    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
        const values = metadata as Record<string, unknown>;
        for (const key of descriptiveMetadataKeys) {
            const value = values[key];
            if (typeof value === "string" && value.trim()) {
                return { label: value.trim(), fullValue: value.trim(), isFallback: false };
            }
        }
    }

    if (!entityId) return { label: "—", fullValue: "—", isFallback: true };
    const label = entityId.length > 12 ? `#${entityId.slice(0, 8)}…` : entityId;
    return { label, fullValue: entityId, isFallback: true };
}
