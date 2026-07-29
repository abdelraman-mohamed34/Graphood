import crypto from "crypto";

const SECRET =
    process.env.API_KEY_ENCRYPTION_SECRET!;

export function encryptApiKey(
    apiKey: string
) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET, "hex"),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(apiKey),
        cipher.final(),
    ]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}