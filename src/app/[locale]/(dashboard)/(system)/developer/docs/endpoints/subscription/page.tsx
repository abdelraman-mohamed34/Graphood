'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { url } from "../tenant/page";

export default function SubscriptionEndpointPage() {
    const t = useTranslations("SubscriptionEndpointPage");

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-600/10 dark:bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        GET
                    </span>

                    <code className="text-base font-semibold text-foreground sm:text-lg">
                        /subscription
                    </code>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
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

                <CodeBlock code="Authorization: Bearer YOUR_API_KEY" />
            </section>

            {/* HTTP Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("httpRequest.title")}
                </h2>

                <CodeBlock code="GET /api/developer/v1/subscription" />
            </section>

            {/* Query Parameters */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("queryParams.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("queryParams.headers.name")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("queryParams.headers.type")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("queryParams.headers.required")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("queryParams.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    tenantSlug
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                                    {t("queryParams.list.tenantSlug.required")}
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("queryParams.list.tenantSlug.description")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Example Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("exampleRequest.title")}
                </h2>

                <CodeBlock
                    code={`curl --request GET \\
  --url ${url}/api/developer/v1/subscription?tenantSlug=workspace-6376e0e4 \\
  --header "Authorization: Bearer YOUR_API_KEY"`}
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
    "subscription": {
      "plan": "PRO",
      "status": "ACTIVE",
      "licenseType": "SUBSCRIPTION",
      "billingInterval": "MONTHLY"
    },
    "capabilities": {
      "api": true,
      "reports": true,
      "wordAssistant": true
    }
  }
}`}
                />
            </section>

            {/* Subscription Object Table */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("subscriptionObject.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("subscriptionObject.headers.field")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("subscriptionObject.headers.type")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("subscriptionObject.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    plan
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("subscriptionObject.fields.plan")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    status
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("subscriptionObject.fields.status")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    licenseType
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("subscriptionObject.fields.licenseType")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    billingInterval
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("subscriptionObject.fields.billingInterval")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Capabilities Object Table */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("capabilitiesObject.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("capabilitiesObject.headers.field")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("capabilitiesObject.headers.type")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("capabilitiesObject.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    api
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    boolean
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("capabilitiesObject.fields.api")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    reports
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    boolean
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("capabilitiesObject.fields.reports")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    wordAssistant
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    boolean
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("capabilitiesObject.fields.wordAssistant")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Possible Errors */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("possibleErrors.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("possibleErrors.headers.status")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("possibleErrors.headers.code")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("possibleErrors.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-destructive dark:text-red-400 font-medium">
                                    401
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    INVALID_API_KEY
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("possibleErrors.list.invalidApiKey")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-destructive dark:text-red-400 font-medium">
                                    404
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    TENANT_NOT_FOUND
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("possibleErrors.list.tenantNotFound")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-destructive dark:text-red-400 font-medium">
                                    500
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    UNKNOWN_ERROR
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("possibleErrors.list.unknownError")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}