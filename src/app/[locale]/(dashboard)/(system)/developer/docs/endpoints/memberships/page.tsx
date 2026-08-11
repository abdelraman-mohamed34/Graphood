'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { url } from "inspector";

export default function MembershipsEndpointPage() {
    const t = useTranslations("MembershipsEndpointPage");

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-600/10 dark:bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        GET
                    </span>

                    <code className="text-base font-semibold text-foreground sm:text-lg">
                        /memberships
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

                <CodeBlock code="GET /api/developer/v1/memberships" />
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
  --url ${url}/api/developer/v1/memberships?tenantSlug=workspace-6376e0e4 \\
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
    "memberships": [
      {
        "id": "95dd07df-4fff-4a5a-9652-c8a2f04db9f3",
        "role": "OWNER",
        "permissions": [],
        "status": "ACTIVE",
        "user": {
          "id": "05575f77-ea95-4813-82e3-7bd71cd1be92",
          "firstName": "Abdelrahman",
          "lastName": "Mohamed",
          "email": "abdelraman.mohamed34@gmail.com",
          "avatarUrl": null
        },
        "joinedAt": "2026-07-31T07:01:42.961555+00:00",
        "createdAt": "2026-07-31T07:01:42.961555+00:00"
      }
    ]
  }
}`}
                />
            </section>

            {/* Membership Object Table */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("membershipObject.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("membershipObject.headers.field")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("membershipObject.headers.type")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("membershipObject.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    id
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.id")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    role
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.role")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    permissions
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    string[]
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.permissions")}
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
                                    {t("membershipObject.fields.status")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    user
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    object
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.user")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    joinedAt
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    datetime
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.joinedAt")}
                                </td>
                            </tr>

                            <tr className="transition-colors hover:bg-muted/30">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                                    createdAt
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-muted-foreground">
                                    datetime
                                </td>
                                <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                    {t("membershipObject.fields.createdAt")}
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