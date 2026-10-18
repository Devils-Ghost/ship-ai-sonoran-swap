import { PageIntro } from "@/components/layout/page-intro";
import { VisualizerRoot } from "@/components/visualize/visualizer-app";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/visualize");

// SRS §6.4 / §10. Copy: CONTENT §5. No breadcrumbs (SRS §5.2). Fully static; ?style and ?demo apply on the client.
export default function VisualizePage() {
  return (
    <>
      <PageIntro
        title="See your lawn as a desert yard."
        lead="Pick a style, then upload a photo of your front lawn or try a sample yard."
        className="pb-8 lg:pb-10"
      />
      <VisualizerRoot />
    </>
  );
}
