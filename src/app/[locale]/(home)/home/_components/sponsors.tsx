import { useTranslations } from "next-intl";

const sponsorsList = [
    { name: "Zoom", logo: "/logos/zoom.svg" },
    { name: "Brex", logo: "/logos/brex.svg" },
    { name: "DoorDash", logo: "/logos/doordash.svg" },
    { name: "Zapier", logo: "/logos/zapier.svg" },
    { name: "Expensify", logo: "/logos/expensify.svg" },
    { name: "Eventbrite", logo: "/logos/eventbrite.svg" },
];

export default function Sponsors() {
    const t = useTranslations("home.landing.sponsors");

    return (
        <section className="w-full p-6">
            <div className="w-full max-w-7xl mx-auto py-12 flex flex-col items-center gap-8">
                <p className="text-sm md:text-base text-neutral-600 font-medium tracking-wide text-center">
                    {t("eyebrow")}
                </p>

                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-neutral-300/70 bg-white/50 backdrop-blur-sm rounded-sm overflow-hidden divide-x divide-y md:divide-y-0 divide-neutral-300/70">
                    {sponsorsList.map((sponsor, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-6 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300 bg-white/40 hover:bg-white"
                        >
                            <span className="font-bold text-xl tracking-tight text-neutral-800">
                                {sponsor.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
