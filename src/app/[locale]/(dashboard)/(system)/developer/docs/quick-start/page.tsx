'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";

export default function QuickStartPage() {
    const t = useTranslations("QuickStartPage");

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

            {/* Base URL */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("baseUrl.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("baseUrl.description")}
                </p>

                <CodeBlock language="text" code="https://api.graphood.com/api/developer/v1" />

                <p className="text-xs text-muted-foreground sm:text-sm">
                    {t("baseUrl.localDev")}
                </p>

                <CodeBlock language="text" code="http://localhost:3000/api/developer/v1" />
            </section>

            {/* Authentication */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("auth.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("auth.description")}
                </p>

                <CodeBlock language="text" code="Authorization: Bearer YOUR_API_KEY" />
            </section>

            {/* Your First Request */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("firstRequest.title")}
                </h2>

                <p className="text-sm text-muted-foreground sm:text-base">
                    {t("firstRequest.description")}
                </p>

                <CodeBlock
                    language="bash"
                    code={`curl --request GET \\
  --url http://localhost:3000/api/developer/v1/me?tenantSlug=workspace-slug \\
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
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.auth.description")}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.endpoints.title")}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.endpoints.description")}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.responseFormat.title")}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.responseFormat.description")}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {t("nextSteps.items.errors.title")}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                            {t("nextSteps.items.errors.description")}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
