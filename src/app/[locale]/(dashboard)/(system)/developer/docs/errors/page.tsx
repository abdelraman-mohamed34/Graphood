'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { InlineCode } from "@/shared/_components/inline-code";

export default function ErrorsPage() {
    const t = useTranslations("ErrorsPage");

    const httpStatuses = [
        { status: "200 OK", color: "success" as const, meaning: t("httpStatuses.list.ok") },
        { status: "400 Bad Request", color: "danger" as const, meaning: t("httpStatuses.list.badRequest") },
        { status: "401 Unauthorized", color: "danger" as const, meaning: t("httpStatuses.list.unauthorized") },
        { status: "403 Forbidden", color: "danger" as const, meaning: t("httpStatuses.list.forbidden") },
        { status: "404 Not Found", color: "danger" as const, meaning: t("httpStatuses.list.notFound") },
        { status: "500 Internal Error", color: "danger" as const, meaning: t("httpStatuses.list.internalError") },
    ];

    const errorCodes = [
        { code: "INVALID_API_KEY", description: t("errorCodes.list.INVALID_API_KEY") },
        { code: "MISSING_API_KEY", description: t("errorCodes.list.MISSING_API_KEY") },
        { code: "SYSTEM_NOT_FOUND", description: t("errorCodes.list.SYSTEM_NOT_FOUND") },
        { code: "TENANT_NOT_FOUND", description: t("errorCodes.list.TENANT_NOT_FOUND") },
        { code: "UNKNOWN_ERROR", description: t("errorCodes.list.UNKNOWN_ERROR") },
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

            {/* Error Response Format */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("errorFormat.title")}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                    {t.rich("errorFormat.description", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    })}
                </p>

                <CodeBlock
                    language="json"
                    code={`{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid."
  }
}`}
                />
            </section>

            {/* HTTP Status Codes */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("httpStatuses.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">{t("httpStatuses.headers.status")}</th>
                                <th className="px-5 py-3.5 text-start font-medium">{t("httpStatuses.headers.meaning")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {httpStatuses.map((item) => (
                                <tr key={item.status} className="transition-colors hover:bg-muted/30">
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode color={item.color}>
                                            {item.status}
                                        </InlineCode>
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                        {item.meaning}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Error Codes */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("errorCodes.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">{t("errorCodes.headers.code")}</th>
                                <th className="px-5 py-3.5 text-start font-medium">{t("errorCodes.headers.description")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {errorCodes.map((err) => (
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
        </div>
    );
}
