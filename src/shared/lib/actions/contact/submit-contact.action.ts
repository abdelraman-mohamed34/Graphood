"use server";

import { z } from "zod";
import { Resend } from "resend";
import { getResendApiKey, getResendDeliveryConfig } from "@/shared/lib/email/resend-config";

const schema = z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().optional(),
    category: z.enum(["sales", "techSupport", "partnerships", "general"]),
    subject: z.string().trim().min(2).max(180),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0).optional(),
});

export async function submitContactAction(input: unknown) {
    const parsed = schema.safeParse(input);
    if (!parsed.success || parsed.data.website) return { success: false as const, code: "INVALID" as const };
    const { fullName, email, phone, category, subject, message } = parsed.data;
    const apiKey = getResendApiKey("Contact email");
    if (!apiKey) return { success: false as const, code: "SEND_FAILED" as const };

    const delivery = getResendDeliveryConfig("contact@graphood.com");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from: delivery.from,
        to: delivery.to,
        replyTo: email,
        subject: `[${category}] ${subject}`,
        text: `Name: ${fullName}\nEmail: ${email}\nWhatsApp / Phone: ${phone || "Not provided"}\nCategory: ${category}\n\n${message}`,
    });
    if (error) {
        console.error("Contact Resend Error:", error);
        return { success: false as const, code: "SEND_FAILED" as const };
    }
    return { success: true as const };
}
