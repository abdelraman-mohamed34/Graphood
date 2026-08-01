import { createAdminClient } from "../../admin";

const DEFAULT_LENGTH = 10;
// Unambiguous character set (Excludes I, O, 1, 0)
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generate a cryptographically secure random string
 */
function generateSecureCode(length: number): string {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);

    let result = "";
    for (let i = 0; i < length; i++) {
        // Map byte values modulo CHARS.length to strictly avoid bias issues
        result += CHARS[randomBytes[i] % CHARS.length];
    }

    return result;
}

/**
 * Generates a unique coupon code with collision checks and attempt limits.
 */
export async function generateCouponCode(
    length = DEFAULT_LENGTH,
    maxAttempts = 5
): Promise<string> {
    const supabase = createAdminClient();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateSecureCode(length);

        const { data, error } = await supabase
            .from("coupons")
            .select("id")
            .eq("code", code)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to check coupon code uniqueness: ${error.message}`);
        }

        if (!data) {
            return code;
        }
    }

    throw new Error(
        `Failed to generate a unique coupon code after ${maxAttempts} attempts.`
    );
}