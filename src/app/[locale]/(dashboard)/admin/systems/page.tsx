import { getTranslations } from "next-intl/server";
import { SystemsHeader } from "./_components/systems-header";
import { SystemsTable } from "./_components/systems-table";

export async function generateMetadata() {
    const t = await getTranslations("AdminSystems");
    return { title: t("metadataTitle") };
}

export default function SystemsPage() {
    return (
        <div className="space-y-6">
            <SystemsHeader />
            <SystemsTable />
        </div>
    );
}
