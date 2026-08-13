import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/shared/_components/markdown-renderer";
import { getSystemReadmeReviewAction } from "@/shared/lib/actions/admin/systems.action";
import { ApproveReadmeButton } from "./_components/approve-readme-button";

export default async function SystemReadmeReviewPage({ params }: { params: Promise<{ systemId: string }> }) {
    const { systemId } = await params;
    const t = await getTranslations("AdminSystems.review");
    const result = await getSystemReadmeReviewAction(systemId);
    if (!result.success || !result.data) notFound();
    const review = result.data;

    return (
        <main className="space-y-6" dir="auto">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="text-start">
                    <h1 className="text-2xl font-bold">{t("title", { system: review.name })}</h1>
                    <p className="text-sm text-muted-foreground">{t("submittedBy", { developer: review.ownerName || review.ownerId })}</p>
                </div>
                <ApproveReadmeButton systemId={systemId} disabled={review.pendingReadme === null} />
            </header>
            {review.pendingReadme === null ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t("noPending")}</div>
            ) : (
                <div className="grid items-start gap-6 xl:grid-cols-2">
                    <ReadmeCard title={t("live")} readme={review.liveReadme} empty={t("emptyLive")} />
                    <ReadmeCard title={t("pending")} readme={review.pendingReadme} empty={t("emptyPending")} />
                </div>
            )}
        </main>
    );
}

function ReadmeCard({ title, readme, empty }: { title: string; readme: string; empty: string }) {
    return (
        <Card className="min-w-0">
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>{readme.trim() ? <MarkdownRenderer markdown={readme} /> : <p className="text-sm text-muted-foreground">{empty}</p>}</CardContent>
        </Card>
    );
}
