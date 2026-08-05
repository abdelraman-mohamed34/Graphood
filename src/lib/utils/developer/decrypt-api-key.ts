import crypto from "crypto";

const SECRET =
    process.env.API_KEY_ENCRYPTION_SECRET!;

export function decryptApiKey(
    encryptedKey: string
) {
    const [
        ivHex,
        encryptedHex,
    ] = encryptedKey.split(":");

    const iv = Buffer.from(
        ivHex,
        "hex"
    );

    const encryptedText = Buffer.from(
        encryptedHex,
        "hex"
    );

    const decipher =
        crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(SECRET, "hex"),
            iv
        );

    const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
import "server-only";