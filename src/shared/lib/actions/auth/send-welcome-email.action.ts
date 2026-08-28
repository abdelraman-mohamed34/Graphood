"use server";

import { sendSystemEmail } from "@/shared/lib/email/send-system-email";

export async function sendWelcomeEmailAction(input: { to: string; name?: string; locale?: "ar" | "en" }) {
    try {
        return await sendSystemEmail({
            to: input.to,
            event: "WELCOME_USER",
            locale: input.locale,
            payload: { name: input.name, loginUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${input.locale ?? "en"}/login` },
        });
    } catch (error) {
        console.error("Welcome email dispatch failed:", error);
        return { success: false as const, error };
    }
}
