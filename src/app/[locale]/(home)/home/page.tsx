import { HatchedContainer } from "@/shared/_components/hatched-container";
import Sponsors from "./_components/sponsors";
import EcosystemSuite from "./_components/ecosystem-suite";
import VisionBanner from "./_components/vision-banner";
import FAQ from "./_components/faq";
import Footer from "../../(main)/_components/footer/Footer";

export default function Page() {
  return (
    <main className="min-h-screen ">
      <div className="min-h-screen w-full flex bg-maroon"></div>
      <section className="w-full flex justify-center">
        <HatchedContainer
          padding="p-8"
          direction="diagonal"
          sides="x"
          className="max-w-6xl w-full"
        >
          <div className="bg-white min-h-screen">
            <Sponsors />
            <EcosystemSuite />
          </div>
        </HatchedContainer>
      </section>
      <VisionBanner />
      <div className="bg-maroon">
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
