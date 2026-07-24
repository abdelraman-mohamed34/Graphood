import crypto from "crypto";

const API_KEY_PREFIX = "gh_sk_";
const API_KEY_BYTES = 32;

export function generateApiKey(): string {
    const random = crypto.randomBytes(API_KEY_BYTES).toString("hex");

    return `${API_KEY_PREFIX}${random}`;
}