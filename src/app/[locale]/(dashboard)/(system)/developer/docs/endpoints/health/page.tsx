'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { DEVELOPER_API_BASE_URL } from "@/shared/lib/api/developer/base-url";

export default function HealthEndpointPage() {
    const t = useTranslations("HealthEndpointPage");

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-600/10 dark:bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        GET
                    </span>

                    <code className="text-base font-semibold text-foreground sm:text-lg">
                        /health
                    </code>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </p>
            </header>

            {/* Authentication */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("auth.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("auth.description")}
                </p>
            </section>

            {/* HTTP Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("httpRequest.title")}
                </h2>

                <CodeBlock code="GET /api/developer/v1/health" />
            </section>

            {/* Query Parameters */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("queryParams.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("queryParams.description")}
                </p>
            </section>

            {/* Example Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("exampleRequest.title")}
                </h2>

                <CodeBlock
                    code={`curl --request GET \\
  --url ${DEVELOPER_API_BASE_URL}/health`}
                />
            </section>

            {/* Example Response */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("exampleResponse.title")}
                </h2>

                <CodeBlock
                    code={`{
  "success": true,
  "data": {
    "status": "ok"
  }
}`}
                />
            </section>

            {/* Status Codes */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("statusCodes.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("statusCodes.headers.code")}
                                </th>

                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("statusCodes.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                    200 OK
                                </td>

                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("statusCodes.list.ok")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
