'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { InlineCode } from "@/shared/_components/inline-code";
import {
    DEVELOPER_API_BASE_URL,
    DEVELOPER_SANDBOX_API_BASE_URL,
} from "@/shared/lib/api/developer/base-url";

export default function AuthenticationPage() {
    const t = useTranslations("AuthenticationPage");

    const authErrors = [
        {
            code: "MISSING_API_KEY",
            description: t("errors.list.MISSING_API_KEY"),
        },
        {
            code: "INVALID_API_KEY",
            description: t("errors.list.INVALID_API_KEY"),
        },
        {
            code: "REVOKED_API_KEY",
            description: t("errors.list.REVOKED_API_KEY"),
        },
        {
            code: "SYSTEM_NOT_FOUND",
            description: t("errors.list.SYSTEM_NOT_FOUND"),
        },
    ];

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </p>
            </header>

            {/* Authentication Method */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("method.title")}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                    {t.rich("method.description", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    })}
                </p>

                <CodeBlock language="text" code="Authorization: Bearer YOUR_API_KEY" />
            </section>

            {/* Test API Keys */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("testKeys.title")}
                </h2>

                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 dark:bg-sky-500/10">
                    <div className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {t("testKeys.description")}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-xs font-medium text-muted-foreground">{t("testKeys.production")}</div>
                            <code className="mt-1 block text-sm font-semibold text-emerald-600 dark:text-emerald-400">gh_live_...</code>
                        </div>
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-xs font-medium text-muted-foreground">{t("testKeys.sandbox")}</div>
                            <code className="mt-1 block text-sm font-semibold text-sky-600 dark:text-sky-400">gh_test_...</code>
                        </div>
                    </div>
                </div>
            </section>

            {/* Generating an API Key */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("generate.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("generate.description")}
                </p>

                <ol className="list-decimal space-y-2.5 ps-6 text-sm text-muted-foreground sm:text-base">
                    <li>{t("generate.steps.step1")}</li>
                    <li>{t("generate.steps.step2")}</li>
                    <li>
                        {t.rich("generate.steps.step3", {
                            strong1: (chunks) => <strong className="text-foreground font-semibold">{chunks}</strong>,
                        })}
                    </li>
                    <li>
                        {t.rich("generate.steps.step4", {
                            strong1: (chunks) => <strong className="text-foreground font-semibold">{chunks}</strong>,
                        })}
                    </li>
                    <li>{t("generate.steps.step5")}</li>
                </ol>
            </section>

            {/* Example Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("example.title")}
                </h2>

                <CodeBlock
                    language="bash"
                    code={`curl --request GET \\
  --url ${DEVELOPER_API_BASE_URL}/me?tenantSlug=workspace-slug \\
  --header "Authorization: Bearer YOUR_API_KEY"`}
                />

                <h3 className="font-semibold text-foreground">{t("example.sandboxTitle")}</h3>
                <CodeBlock
                    language="bash"
                    code={`curl --request GET \\
  --url ${DEVELOPER_SANDBOX_API_BASE_URL}/me?tenantSlug=sandbox \\
  --header "Authorization: Bearer gh_test_YOUR_API_KEY"`}
                />
            </section>

            {/* Authentication Errors */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("errors.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("errors.headers.code")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("errors.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {authErrors.map((err) => (
                                <tr key={err.code} className="transition-colors hover:bg-muted/30">
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode color="danger">{err.code}</InlineCode>
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                        {err.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Security Best Practices */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("bestPractices.title")}
                </h2>

                <div className="rounded-xl border bg-amber-500/5 p-5 dark:bg-amber-500/10">
                    <ul className="list-disc space-y-2 ps-5 text-sm text-muted-foreground sm:text-base">
                        <li>
                            {t.rich("bestPractices.list.item1", {
                                strong1: (chunks) => <strong className="text-foreground font-semibold">{chunks}</strong>,
                            })}
                        </li>
                        <li>{t("bestPractices.list.item2")}</li>
                        <li>{t("bestPractices.list.item3")}</li>
                        <li>{t("bestPractices.list.item4")}</li>
                        <li>{t("bestPractices.list.item5")}</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
