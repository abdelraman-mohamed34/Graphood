"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MessageCircle, ChevronDown } from "lucide-react";
import { IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react";
import { toast } from "sonner";
import { submitContactAction } from "@/shared/lib/actions/contact/submit-contact.action";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
    fullName: z.string().trim().min(2),
    email: z.string().email(),
    phone: z.string().trim().optional(),
    category: z.enum(["sales", "techSupport", "partnerships", "general"]),
    subject: z.string().trim().min(2),
    message: z.string().trim().min(10),
    website: z.string().max(0).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
    const t = useTranslations("contactUs");
    const locale = useLocale();
    const [sending, setSending] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { category: "general", website: "", phone: "" },
    });

    async function onSubmit(values: FormValues) {
        setSending(true);
        const result = await submitContactAction(values);
        setSending(false);
        if (result.success) {
            toast.success(t("success"));
            reset({ category: "general", website: "", phone: "" });
        } else {
            toast.error(t(result.code === "INVALID" ? "validation" : "error"));
        }
    }

    return (
        <main
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="mx-auto max-w-6xl px-4 py-12 text-start sm:py-16"
        >
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <section className="rounded-xl bg-maroon p-6 text-white sm:p-8">
                    <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
                    <p className="mt-4 text-sm leading-6 text-white/70">
                        {t("subtitle")}
                    </p>
                    <div className="mt-10 space-y-5">
                        <a
                            href="mailto:contact@graphood.com"
                            className="flex items-center gap-3 text-sm"
                        >
                            <span className="rounded-md bg-white/10 p-2">
                                <Mail className="size-4" />
                            </span>
                            <span>
                                <span className="block text-xs text-white/60">
                                    {t("email")}
                                </span>
                                <span className="font-medium">{t("emailBadge")}</span>
                            </span>
                        </a>
                        <a
                            href="https://wa.me/201021079171"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 text-sm"
                        >
                            <span className="rounded-md bg-white/10 p-2">
                                <MessageCircle className="size-4" />
                            </span>
                            <span>
                                <span className="block text-xs text-white/60">
                                    {t("whatsapp")}
                                </span>
                                <span className="font-medium" dir="ltr">
                                    +20 102 107 9171
                                </span>
                            </span>
                        </a>
                        <p className="border-t border-white/10 pt-5 text-sm text-white/70">
                            {t("sla")}
                        </p>
                        <div className="flex gap-2 pt-2">
                            <a
                                href="https://instagram.com/graphoodhq"
                                aria-label="Instagram"
                                className="rounded-md border border-white/15 p-2 transition-colors hover:bg-white/10"
                            >
                                <IconBrandInstagram className="size-4" />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/graphood"
                                aria-label="LinkedIn"
                                className="rounded-md border border-white/15 p-2 transition-colors hover:bg-white/10"
                            >
                                <IconBrandLinkedin className="size-4" />
                            </a>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-foreground">
                        {t("formTitle")}
                    </h2>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-6 grid gap-5 sm:grid-cols-2"
                    >
                        <div className="space-y-2">
                            <Label>{t("fullName")}</Label>
                            <Input
                                {...register("fullName")}
                                placeholder={t("placeholderName")}
                                aria-invalid={!!errors.fullName}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("emailField")}</Label>
                            <Input
                                type="email"
                                {...register("email")}
                                placeholder={t("placeholderEmail")}
                                aria-invalid={!!errors.email}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("phoneField")}</Label>
                            <Input
                                type="tel"
                                {...register("phone")}
                                placeholder={t("placeholderPhone")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("category")}</Label>
                            <div className="relative">
                                <select
                                    {...register("category")}
                                    className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="general" className="bg-popover text-popover-foreground">
                                        {t("categories.general")}
                                    </option>
                                    <option value="sales" className="bg-popover text-popover-foreground">
                                        {t("categories.sales")}
                                    </option>
                                    <option value="techSupport" className="bg-popover text-popover-foreground">
                                        {t("categories.techSupport")}
                                    </option>
                                    <option value="partnerships" className="bg-popover text-popover-foreground">
                                        {t("categories.partnerships")}
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 opacity-50 ltr:right-3 rtl:left-3" />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>{t("subject")}</Label>
                            <Input
                                {...register("subject")}
                                placeholder={t("placeholderSubject")}
                                aria-invalid={!!errors.subject}
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>{t("message")}</Label>
                            <Textarea
                                {...register("message")}
                                placeholder={t("placeholderMessage")}
                                className="min-h-36"
                                aria-invalid={!!errors.message}
                            />
                        </div>
                        <input
                            {...register("website")}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            className="hidden"
                        />
                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-maroon text-white hover:bg-teal"
                            >
                                {sending ? t("sending") : t("submit")}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
