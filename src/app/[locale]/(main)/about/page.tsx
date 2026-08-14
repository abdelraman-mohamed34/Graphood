import { ArrowUpRight, Terminal } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AboutExperience from "@/components/about/AboutExperience";


export default async function AboutPage() {
    const t = await getTranslations("about");

    return (
        <main className="min-h-screen overflow-hidden bg-[#f4f3f1] text-[#21181b]">

            <AboutExperience />

            <section aria-labelledby="about-cta-title" className="px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-28">
                <div className="mx-auto max-w-7xl border border-neutral-300 bg-white">
                    <div className="grid lg:grid-cols-[1fr_auto]">
                        <div className="border-b border-neutral-200 p-8 sm:p-12 lg:border-b-0 lg:border-e">
                            <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-teal-700">
                                <Terminal className="size-4" aria-hidden="true" />
                                <span>{t("cta.eyebrow")}</span>
                            </div>
                            <h2 id="about-cta-title" className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                {t("cta.title")}
                            </h2>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
                                {t("cta.description")}
                            </p>
                        </div>

                        <div className="flex min-w-72 items-stretch p-4 sm:p-6">
                            <Link
                                href="/developer/docs"
                                className="group flex w-full items-center justify-between gap-8 border border-maroon bg-maroon px-6 py-5 text-sm font-semibold text-white transition-colors hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
                            >
                                <span>{t("cta.button")}</span>
                                <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:rotate-[-90deg] rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
