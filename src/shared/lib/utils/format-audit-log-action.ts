export const auditLogActionTranslationKeys = {
    STAFF_INVITED: "actions.STAFF_INVITED",
    STAFF_REMOVED: "actions.STAFF_REMOVED",
    STAFF_ROLE_UPDATED: "actions.STAFF_ROLE_UPDATED",
    SYSTEM_STATUS_ACTIVE: "actions.SYSTEM_STATUS_ACTIVE",
    SYSTEM_STATUS_SUSPENDED: "actions.SYSTEM_STATUS_SUSPENDED",
    SYSTEM_STATUS_REJECTED: "actions.SYSTEM_STATUS_REJECTED",
    SYSTEM_STATUS_PENDING: "actions.SYSTEM_STATUS_PENDING",
    SYSTEM_PROFILE_UPDATE_SUBMITTED: "actions.SYSTEM_PROFILE_UPDATE_SUBMITTED",
    SYSTEM_README_APPROVED: "actions.SYSTEM_README_APPROVED",
} as const;

type AuditLogAction = keyof typeof auditLogActionTranslationKeys;
type AuditLogActionTranslationKey = (typeof auditLogActionTranslationKeys)[AuditLogAction];

export interface AuditLogTranslationFunction {
    (key: AuditLogActionTranslationKey): string;
    has(key: AuditLogActionTranslationKey): boolean;
}

export function getAuditLogActionLabel(
    action: string,
    t: AuditLogTranslationFunction,
): string {
    if (!(action in auditLogActionTranslationKeys)) {
        return action;
    }

    const translationKey = auditLogActionTranslationKeys[action as AuditLogAction];
    return t.has(translationKey) ? t(translationKey) : action;
}

export type AuditLogActionTone = "success" | "warning" | "info" | "neutral";

export function getAuditLogActionTone(action: string): AuditLogActionTone {
    if (action === "SYSTEM_README_APPROVED") return "success";
    if (action === "SYSTEM_PROFILE_UPDATE_SUBMITTED") return "info";
    if (action === "SYSTEM_STATUS_ACTIVE") return "success";
    if (action === "STAFF_INVITED") return "info";
    if (
        action === "SYSTEM_STATUS_SUSPENDED"
        || action === "SYSTEM_STATUS_REJECTED"
        || action === "STAFF_REMOVED"
    ) {
        return "warning";
    }
    return "neutral";
}
