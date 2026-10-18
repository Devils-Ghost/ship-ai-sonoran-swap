import { PageIntro } from "@/components/layout/page-intro";
import { StudioRoot } from "@/components/studio/studio-app";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/studio");

// SRS §6.2 / §8. Copy: CONTENT §3. No breadcrumbs here (SRS §5.2). Fully static; StudioRoot applies ?sqft&city&tier
// on the client so the page needs no Suspense hole.
export default function StudioPage() {
  return (
    <>
      <PageIntro
        title="Measure your lawn. See your rebate."
        lead="Outline your lawn on a satellite map, enter the square footage you know, or try a sample yard."
        className="pb-8 lg:pb-10"
      />
      <StudioRoot />
    </>
  );
}
