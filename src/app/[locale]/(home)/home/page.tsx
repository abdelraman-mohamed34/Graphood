"use client";

import InfiniteImageSlider from "../../(main)/_components/test/infinite-image-slider";
import SnapGallery from "../../(main)/_components/test/SnapGallery";
import TechPeopleSection from "../../(main)/_components/test/TechPeopleSection";
import GetStartSection from "../../(main)/_components/test/get-start-section";
import CyberXHeroFooter from "../../(main)/_components/test/CyberXHeroFooter";
import CyberXHeroSection from "../../(main)/_components/test/CyberXHeroSection";
import Footer from "../../(main)/_components/footer/Footer";

export default function Page() {
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
