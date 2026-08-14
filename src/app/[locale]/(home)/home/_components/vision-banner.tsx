import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VisionBanner() {
    const t = useTranslations("home.landing.vision");

    return (
        <section className="relative flex min-h-[430px] w-full justify-center overflow-hidden bg-teal px-8 text-white sm:px-12 md:px-16">
            <div className="grid w-full max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="relative flex h-full w-full justify-center bg-[#06231fa1] lg:col-span-6">
                    <div className="absolute h-[200px] w-full overflow-hidden border border-white/5 bg-red-950 p-6">
                        <p className="break-all text-[15px] leading-relaxed text-[#1f7a6b] opacity-60 select-none">
                            {Array(40).fill(`${t("backgroundText")} `).join("")}
                        </p>
                    </div>

                    <div className="absolute h-[170px] w-[450px] translate-y-[50px] overflow-hidden border-white/10 bg-red-700" />

                    <div className="absolute h-[180px] w-[420px] translate-y-[100px] overflow-hidden border border-white/10 bg-red-500 shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:10px_10px]" />
                    </div>

                    <div className="absolute z-10 flex h-[180px] w-[380px] translate-y-[150px] justify-center border border-white/20 bg-[#a855f7]/30 p-4 backdrop-blur-md">
                        <p className="text-center text-[11px] leading-relaxed text-purple-100 italic sm:text-xs">
                            “{t("quote")}”
                        </p>
                    </div>
                </div>

                <div className="flex h-full flex-col items-start justify-between py-5 lg:col-span-6 lg:ps-4">
                    <div>
                        <h3 className="mb-6 text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl md:text-[56px]">
                            {t("title")}
                        </h3>

                        <p className="mb-8 max-w-xl text-base leading-relaxed font-light text-[#9ec2bc] sm:text-lg">
                            {t.rich("description", {
                                emphasis: (chunks) => <span className="font-normal italic text-white">{chunks}</span>,
                            })}
                        </p>
                    </div>

                    <Link
                        href="/about"
                        className="inline-block rounded border border-emerald-600/60 bg-transparent px-6 py-3 text-xs font-medium text-white transition-all duration-300 hover:border-white/50 hover:bg-white/5 sm:text-sm"
                    >
                        {t("cta")}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default VisionBanner;
