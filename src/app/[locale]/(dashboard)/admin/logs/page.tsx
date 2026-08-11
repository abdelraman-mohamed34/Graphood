import { getTranslations, setRequestLocale } from "next-intl/server";
import AuditLogsView from "./_components/audit-logs-view";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
    const t = await getTranslations("AdminAuditLogs");
    return { title: t("metadataTitle") };
}

export default async function AuditLogsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("AdminAuditLogs");

    return (
        <div className="container mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("header.title")}</h1>
                <p className="text-muted-foreground text-sm">
                    {t("header.description")}
                </p>
            </div>

            <AuditLogsView locale={locale} />
        </div>
    );
}
