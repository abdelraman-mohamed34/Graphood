'use client';

import { useTranslations } from "next-intl";
import { CodeBlock } from "@/shared/_components/code-block";
import { InlineCode } from "@/shared/_components/inline-code";

export default function ResponseFormatPage() {
    const t = useTranslations("ResponseFormatPage");

    const fields = [
        {
            name: "success",
            type: "boolean",
            description: t("fieldsBreakdown.list.success"),
        },
        {
            name: "data",
            type: "object | array",
            description: t("fieldsBreakdown.list.data"),
        },
        {
            name: "error",
            type: "object",
            description: t("fieldsBreakdown.list.error"),
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

            {/* Successful Response */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("successfulResponse.title")}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                    {t.rich("successfulResponse.description", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                        code2: (chunks) => (
                            <InlineCode color="success">{chunks}</InlineCode>
                        ),
                        code3: (chunks) => <InlineCode>{chunks}</InlineCode>,
                    })}
                </p>

                <CodeBlock
                    language="json"
                    code={`{
  "success": true,
  "data": {
    "id": "sys_98231",
    "name": "Acme Workspace",
    "status": "active"
  }
}`}
                />
            </section>

            {/* Error Response */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("errorResponse.title")}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                    {t.rich("errorResponse.description", {
                        code1: (chunks) => <InlineCode>{chunks}</InlineCode>,
                        code2: (chunks) => (
                            <InlineCode color="danger">{chunks}</InlineCode>
                        ),
                        code3: (chunks) => <InlineCode>{chunks}</InlineCode>,
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

            {/* Response Fields */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("fieldsBreakdown.title")}
                </h2>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("fieldsBreakdown.headers.field")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("fieldsBreakdown.headers.type")}
                                </th>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("fieldsBreakdown.headers.description")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {fields.map((field) => (
                                <tr
                                    key={field.name}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode>{field.name}</InlineCode>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode>{field.type}</InlineCode>
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                        {field.description}
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
