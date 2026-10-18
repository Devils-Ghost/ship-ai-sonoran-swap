import { LiveBoard } from "@/components/live/live-board";
import { publicEnv } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/live");

// FR-LIVE (SRS §11.3): the full-screen board. No breadcrumbs (SRS §5.2). The QR is tagged ?src=qr-screen (§11.9).
export default function LivePage() {
  const qrUrl = new URL("/?src=qr-screen", publicEnv.siteUrl).toString();
  return <LiveBoard qrUrl={qrUrl} host={new URL(publicEnv.siteUrl).host} />;
}
