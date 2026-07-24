"use client";

import { useTranslations } from "next-intl";
import InfiniteImageSlider from "../../(main)/_components/test/infinite-image-slider";
import SnapGallery from "../../(main)/_components/test/SnapGallery";
import TechPeopleSection from "../../(main)/_components/test/TechPeopleSection";
import GetStartSection from "../../(main)/_components/test/get-start-section";
import CyberXHeroFooter from "../../(main)/_components/test/CyberXHeroFooter";
import CyberXHeroSection from "../../(main)/_components/test/CyberXHeroSection";
import Footer from "../../(main)/_components/footer/Footer";

export default function page() {
  const t = useTranslations("home");

  const getBillingLabel = (billingType: string) => {
    if (billingType === "SUBSCRIPTION") return t("billing.subscription");
    if (billingType === "ONE_TIME") return t("billing.one_time");
    return t("billing.free");
  };


  return (
    <main className="min-h-screen ">
      {/* <Hero /> */}
      <CyberXHeroSection />
      <CyberXHeroFooter />
      <InfiniteImageSlider />
      {/* <Loading /> */}
      <SnapGallery />
      <TechPeopleSection />
      <GetStartSection />
      <Footer />
    </main>
  );
}