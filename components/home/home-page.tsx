import { JsonLd } from "@/components/shared/json-ld";
import { faqJsonLd, homeFaq } from "@/lib/faq";
import { Hero, type Variant } from "./hero";
import {
  CityCards,
  FinalCta,
  HomeFaq,
  PlantsPreview,
  PricingPreview,
  PromiseBand,
  StepsStrip,
  StylesTeaser,
  WhyNowAndWater,
} from "./home-sections";

// SRS §6.1 order. Both headline variants render this static page (SRS §4.8).
export function HomePage({ variant }: { variant: Variant }) {
  const faqs = homeFaq();
  return (
    <>
      <Hero variant={variant} />
      <StepsStrip />
      <CityCards />
      <StylesTeaser />
      <PromiseBand />
      <WhyNowAndWater />
      <PricingPreview />
      <PlantsPreview />
      <HomeFaq faqs={faqs} />
      <FinalCta />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
