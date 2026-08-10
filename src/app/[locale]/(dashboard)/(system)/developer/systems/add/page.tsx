import { getTranslations } from "next-intl/server";
import CreateSystemForm from "./_components/create-system-form";

export default async function Page() {
    const t = await getTranslations("developer.systems.create");

    return (
        <main className="container mx-auto max-w-3xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    {t("title")}
                </h1>

                <p className="mt-2 text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <CreateSystemForm />
        </main>
    );
}