'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { TabbedCodeBlock } from "@/shared/_components/tabbed-code-block";
import {
    DEVELOPER_API_BASE_URL,
    DEVELOPER_SANDBOX_API_BASE_URL,
} from "@/shared/lib/api/developer/base-url";

export default function QuickStartPage() {
    const t = useTranslations("QuickStartPage");

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <div className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </div>
            </header>

            {/* Create a Graphood app */}
            <section className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {t("cli.title")}
                    </h2>

                    <div className="text-sm text-muted-foreground sm:text-base">
                        {t("cli.description")}
                    </div>
                </div>

                <TabbedCodeBlock
                    tabs={[
                        {
                            label: "npm",
                            command: "npx create-graphood-app <project-name>",
                            commandName: "npx",
                            commandNameClassName: "font-semibold text-red-600 dark:text-red-400",
                        },
                        {
                            label: "pnpm",
                            command: "pnpm dlx create-graphood-app <project-name>",
                            commandName: "pnpm",
                            commandNameClassName: "font-semibold text-amber-600 dark:text-amber-400",
                        },
                        {
                            label: "yarn",
                            command: "yarn create graphood-app <project-name>",
                            commandName: "yarn",
                            commandNameClassName: "font-semibold text-sky-600 dark:text-sky-400",
                        },
                    ]}
                />

                <div className="space-y-2 pt-2">
                    <h3 className="font-semibold text-foreground">
                        {t("cli.run.title")}
                    </h3>
                    <div className="text-sm text-muted-foreground sm:text-base">
                        {t("cli.run.description")}
                    </div>
                    <CodeBlock
                        language="bash"
                        code={"cd <project-name>\nnpm run dev"}
                    />
                </div>
            </section>

            {/* Prerequisites */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("prerequisites.title")}
                </h2>

                <ul className="list-disc space-y-2 ps-6 text-sm text-muted-foreground sm:text-base">
                    <li>{t("prerequisites.item1")}</li>
                    <li>{t("prerequisites.item2")}</li>
                    <li>{t("prerequisites.item3")}</li>
                    <li>{t("prerequisites.item4")}</li>
                </ul>
            </section>

            {/* Environments and base URLs */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("environments.title")}
                </h2>

                <div className="text-sm text-muted-foreground sm:text-base">
                    {t("environments.description")}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">{t("environments.table.environment")}</th>
                                <th className="px-5 py-3.5 text-start font-medium">{t("environments.table.baseUrl")}</th>
                                <th className="px-5 py-3.5 text-start font-medium">{t("environments.table.keyPrefix")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr>
                                <td className="px-5 py-4 font-medium">{t("environments.production")}</td>
                                <td className="px-5 py-4 font-mono text-xs sm:text-sm">{DEVELOPER_API_BASE_URL}</td>
                                <td className="px-5 py-4 font-mono text-xs text-emerald-600 dark:text-emerald-400">gh_live_...</td>
                            </tr>
                            <tr>
                                <td className="px-5 py-4 font-medium">{t("environments.sandbox")}</td>
                                <td className="px-5 py-4 font-mono text-xs sm:text-sm">{DEVELOPER_SANDBOX_API_BASE_URL}</td>
                                <td className="px-5 py-4 font-mono text-xs text-sky-600 dark:text-sky-400">gh_test_...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 dark:bg-sky-500/10">
                    <h3 className="font-semibold text-foreground">{t("environments.note.title")}</h3>
                    <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {t("environments.note.description")}
                    </div>
                </div>

                <CodeBlock
                    language="bash"
                    code={`curl --request GET \\
  --url ${DEVELOPER_SANDBOX_API_BASE_URL}/me?tenantSlug=sandbox \\
  --header "Authorization: Bearer gh_test_YOUR_API_KEY"`}
                />

            </section>

            {/* Authentication */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("auth.title")}
                </h2>

                <div className="text-sm text-muted-foreground sm:text-base">
                    {t("auth.description")}
                </div>

                <CodeBlock language="text" code="Authorization: Bearer YOUR_API_KEY" />
            </section>

            {/* Your First Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("firstRequest.title")}
                </h2>

                <div className="text-sm text-muted-foreground sm:text-base">
                    {t("firstRequest.description")}
                </div>

                <CodeBlock
                    language="bash"
                    code={`curl --request GET \\
  --url ${DEVELOPER_API_BASE_URL}/me?tenantSlug=workspace-slug \\
  --header "Authorization: Bearer YOUR_API_KEY"`}
                />
            </section>

            {/* Example Response */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("exampleResponse.title")}
                </h2>

                <CodeBlock
                    language="json"
                    code={`{
  "success": true,
  "data": {
    "name": "Graphood Developer API",
    "version": "v1",
    "status": "ok",
    "message": "Welcome to the Graphood Developer API.",
    "links": {
      "documentation": "/developer/docs",
      "health": "/api/developer/v1/health"
    }
  }
}`}
                />
            </section>

            {/* Next Steps */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("nextSteps.title")}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.auth.title")}
                        </h3>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.auth.description")}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.endpoints.title")}
                        </h3>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.endpoints.description")}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.responseFormat.title")}
                        </h3>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.responseFormat.description")}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.errors.title")}
                        </h3>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.errors.description")}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
