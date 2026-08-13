"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/shared/_components/markdown-editor";
import { useSystem } from "@/shared/lib/hooks";

export function SystemReadmeEditor({ systemId, initialReadme }: { systemId: string; initialReadme: string }) {
    const t = useTranslations("developerOverview.readme");
    const locale = useLocale();
    const dir = locale === "ar" ? "rtl" : "ltr";
    const [readme, setReadme] = useState(initialReadme);
    const [savedReadme, setSavedReadme] = useState(initialReadme);
    const { updateSystem, isUpdating } = useSystem();

    const save = async () => {
        try {
            const result = await updateSystem({ id: systemId, data: { readme } });
            setSavedReadme(readme);
            toast.success(result.pendingReview ? t("submitted") : t("saved"));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("saveError"));
        }
    };

    return (
        <section dir={dir} className="space-y-3 py-6 text-start">
            <div>
                <h2 className="text-lg font-semibold">{t("title")}</h2>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </div>
            <MarkdownEditor
                value={readme}
                onChange={setReadme}
                dir={dir}
                labels={{
                    write: t("writeTab"),
                    preview: t("previewTab"),
                    placeholder: t("placeholder"),
                    empty: t("empty"),
                    editorLabel: t("editorLabel"),
                }}
            />
            <div className="flex justify-end">
                <Button type="button" onClick={save} disabled={isUpdating || readme === savedReadme}>
                    {isUpdating ? t("saving") : t("save")}
                </Button>
            </div>
        </section>
    );
}
