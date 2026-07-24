import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FileQuestionIcon } from "lucide-react";

export default function NotFound() {
    const t = useTranslations("NotFoundPage");

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileQuestionIcon className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t("title")}
                </h1>
                <p className="max-w-[400px] text-muted-foreground">
                    {t("description")}
                </p>
            </div>

            <Button asChild variant="default">
                <Link href="/">
                    {t("goHome")}
                </Link>
            </Button>
        </div>
    );
}