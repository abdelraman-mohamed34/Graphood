import "server-only";

import { Resend } from "resend";
import { getResendApiKey, getResendDeliveryConfig } from "./resend-config";

export type EmailEventType =
    | "WELCOME_USER"
    | "SYSTEM_PUBLISHED"
    | "PURCHASE_SUCCESS"
    | "MEMBER_INVITED"
    | "SUBSCRIPTION_EXPIRING"
    | "CONTACT_FEEDBACK";

type EventPayloadMap = {
    WELCOME_USER: { name?: string; loginUrl?: string };
    SYSTEM_PUBLISHED: { systemName: string; dashboardUrl?: string; supportUrl?: string };
    PURCHASE_SUCCESS: { systemName: string; workspaceUrl?: string; amount?: string; orderId?: string };
    MEMBER_INVITED: { tenantName: string; inviterName: string; acceptUrl: string; message?: string | null };
    SUBSCRIPTION_EXPIRING: { planName: string; expiresAt: string; billingUrl?: string };
    CONTACT_FEEDBACK: { fullName: string; email: string; phone?: string; category: string; subject: string; message: string };
};

type SendSystemEmailArgs<T extends EmailEventType> = {
    to: string;
    event: T;
    payload: EventPayloadMap[T];
    locale?: "ar" | "en";
};

type Template = { subject: string; title: string; body: string; cta?: { label: string; href: string } };

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function GraphoodEmailLayout({ locale, template }: { locale: "ar" | "en"; template: Template }) {
    const direction = locale === "ar" ? "rtl" : "ltr";
    return `<!doctype html><html lang="${locale}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(template.title)}</title></head><body style="margin:0;background:#f4f7f9;font-family:Arial,sans-serif;color:#15232d"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border:1px solid #dbe3e8;border-radius:12px;overflow:hidden"><tr><td style="background:#173b45;padding:24px 32px;color:#fff;font-size:22px;font-weight:700">Graphood</td></tr><tr><td style="padding:32px;text-align:${direction === "rtl" ? "right" : "left"}"><h1 style="margin:0 0 16px;font-size:24px">${escapeHtml(template.title)}</h1><div style="font-size:15px;line-height:1.7">${template.body}</div>${template.cta ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(template.cta.href)}" style="display:inline-block;background:#7A1C1C;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:700">${escapeHtml(template.cta.label)}</a></p>` : ""}</td></tr><tr><td style="border-top:1px solid #edf1f3;padding:20px 32px;color:#71808a;font-size:12px;line-height:1.6;text-align:center">Graphood · support@graphood.com</td></tr></table></td></tr></table></body></html>`;
}

function buildTemplate<T extends EmailEventType>(event: T, payload: EventPayloadMap[T], locale: "ar" | "en"): Template {
    const ar = locale === "ar";
    switch (event) {
        case "WELCOME_USER": {
            const p = payload as EventPayloadMap["WELCOME_USER"];
            return { subject: ar ? "مرحبًا بك في جرافهود" : "Welcome to Graphood", title: ar ? "مرحبًا بك في جرافهود" : "Welcome to Graphood", body: `<p>${ar ? "مرحبًا" : "Hello"} ${escapeHtml(p.name || "there")},</p><p>${ar ? "يسعدنا انضمامك إلى جرافهود." : "We are glad to have you with us."}</p>`, cta: p.loginUrl ? { label: ar ? "تسجيل الدخول" : "Sign in", href: p.loginUrl } : undefined };
        }
        case "SYSTEM_PUBLISHED": {
            const p = payload as EventPayloadMap["SYSTEM_PUBLISHED"];
            return { subject: ar ? "تم نشر نظامك" : "Your system was published", title: ar ? "تم نشر النظام بنجاح" : "System published successfully", body: `<p>${escapeHtml(p.systemName)}</p><p>${ar ? "نظامك متاح الآن على جرافهود." : "Your system is now available on Graphood."}</p>`, cta: p.dashboardUrl ? { label: ar ? "فتح لوحة التحكم" : "Open dashboard", href: p.dashboardUrl } : undefined };
        }
        case "PURCHASE_SUCCESS": {
            const p = payload as EventPayloadMap["PURCHASE_SUCCESS"];
            return { subject: ar ? "تم تأكيد عملية الشراء" : "Purchase confirmed", title: ar ? "تم تأكيد عملية الشراء" : "Purchase confirmed", body: `<p>${escapeHtml(p.systemName)}</p>${p.amount ? `<p>${ar ? "المبلغ" : "Amount"}: ${escapeHtml(p.amount)}</p>` : ""}${p.orderId ? `<p>${ar ? "رقم الطلب" : "Order"}: ${escapeHtml(p.orderId)}</p>` : ""}`, cta: p.workspaceUrl ? { label: ar ? "فتح مساحة العمل" : "Open workspace", href: p.workspaceUrl } : undefined };
        }
        case "MEMBER_INVITED": {
            const p = payload as EventPayloadMap["MEMBER_INVITED"];
            const inviterName = p.inviterName.trim() || "Graphood Admin";
            return { subject: ar ? `دعوة للانضمام إلى ${p.tenantName}` : `You're invited to join ${p.tenantName}`, title: ar ? "لقد تمت دعوتك!" : "You're invited!", body: `<p>${escapeHtml(inviterName)} ${ar ? "دعاك للانضمام إلى" : "invited you to join"} <strong>${escapeHtml(p.tenantName)}</strong>.</p>${p.message ? `<blockquote>${escapeHtml(p.message)}</blockquote>` : ""}`, cta: { label: ar ? "قبول الدعوة" : "Accept invitation", href: p.acceptUrl } };
        }
        case "SUBSCRIPTION_EXPIRING": {
            const p = payload as EventPayloadMap["SUBSCRIPTION_EXPIRING"];
            return { subject: ar ? "اشتراكك على وشك الانتهاء" : "Your subscription is expiring", title: ar ? "تنبيه تجديد الاشتراك" : "Subscription renewal alert", body: `<p>${escapeHtml(p.planName)}</p><p>${ar ? "ينتهي اشتراكك في" : "Your subscription expires on"} ${escapeHtml(p.expiresAt)}.</p>`, cta: p.billingUrl ? { label: ar ? "إدارة الاشتراك" : "Manage subscription", href: p.billingUrl } : undefined };
        }
        case "CONTACT_FEEDBACK": {
            const p = payload as EventPayloadMap["CONTACT_FEEDBACK"];
            return { subject: `[${p.category}] ${p.subject}`, title: ar ? "رسالة تواصل جديدة" : "New contact message", body: `<p><strong>${escapeHtml(p.fullName)}</strong> (${escapeHtml(p.email)})</p><p>${ar ? "الهاتف" : "Phone"}: ${escapeHtml(p.phone || (ar ? "غير مقدم" : "Not provided"))}</p><p>${escapeHtml(p.message).replace(/\n/g, "<br>")}</p>` };
        }
    }
}

export async function sendSystemEmail<T extends EmailEventType>({ to, event, payload, locale = "en" }: SendSystemEmailArgs<T>) {
    const apiKey = getResendApiKey(`${event} email`);
    if (!apiKey) return { success: false as const, error: new Error("RESEND_API_KEY is missing") };
    const recipient = to.trim();
    if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) {
        const error = new Error("A valid recipient email address is required");
        console.error("System email skipped: invalid recipient", { event });
        return { success: false as const, error };
    }
    const template = buildTemplate(event, payload, locale);
    const delivery = getResendDeliveryConfig(recipient);
    try {
        const result = await new Resend(apiKey).emails.send({ from: delivery.from, to: delivery.to, subject: template.subject, html: GraphoodEmailLayout({ locale, template }), text: `${template.title}\n\n${template.body.replace(/<[^>]+>/g, "")}` });
        if (result.error) {
            console.error("System email delivery rejected by Resend", { event, recipient: delivery.to, sender: delivery.from, error: result.error });
            return { success: false as const, error: result.error };
        }
        console.info("System email accepted by Resend", { event, recipient: delivery.to, sender: delivery.from, emailId: result.data?.id });
        return { success: true as const, data: result.data };
    } catch (error) {
        console.error("System email delivery request failed", { event, recipient: delivery.to, sender: delivery.from, error });
        return { success: false as const, error: error instanceof Error ? error : new Error("Email delivery failed") };
    }
}
