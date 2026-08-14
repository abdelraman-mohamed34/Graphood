import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VisionBanner() {
    const t = useTranslations("home.landing.vision");

    return (
        <section className="relative flex min-h-[430px] w-full justify-center overflow-hidden border-y border-neutral-300 bg-white px-8 text-[#21181b] sm:px-12 md:px-16">
            <div className="grid w-full max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="relative flex h-full w-full justify-center bg-[#f4f3f1] lg:col-span-6">
                    <div className="absolute h-[200px] w-full overflow-hidden border border-neutral-300 bg-[#ebe8e5] p-6">
                        <p className="break-all text-[15px] leading-relaxed text-neutral-400 select-none">
                            {Array(40).fill(`${t("backgroundText")} `).join("")}
                        </p>
                    </div>

                    <div className="absolute h-[170px] w-[450px] translate-y-[50px] overflow-hidden border border-neutral-300 bg-[#ddd8d5]" />

                    <div className="absolute h-[180px] w-[420px] translate-y-[100px] overflow-hidden border border-teal/25 bg-[#dce8e5] shadow-lg" />

                    <div className="absolute z-10 flex h-[180px] w-[380px] translate-y-[150px] justify-center border border-neutral-300 bg-white p-4">
                        <p className="text-center text-[11px] leading-relaxed text-maroon italic sm:text-xs">
                            “{t("quote")}”
                        </p>
                    </div>
                </div>

                <div className="flex h-full flex-col items-start justify-between py-5 lg:col-span-6 lg:ps-4">
                    <div>
                        <h3 className="mb-6 text-4xl leading-[1.1] font-semibold tracking-tight text-maroon sm:text-5xl md:text-[56px]">
                            {t("title")}
                        </h3>

                        <p className="mb-8 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                            {t.rich("description", {
                                emphasis: (chunks) => <span className="font-medium italic text-teal">{chunks}</span>,
                            })}
                        </p>
                    </div>

                    <Link
                        href="/about"
                        className="inline-block rounded-sm border border-maroon bg-maroon px-6 py-3 text-xs font-medium text-white transition-all duration-300 hover:bg-teal sm:text-sm"
                    >
                        {t("cta")}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default VisionBanner;
