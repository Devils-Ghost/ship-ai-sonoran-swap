import { HomePage } from "@/components/home/home-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/");

// Headline A. /?v=b is rewritten by proxy.ts to /home-b, which renders the same page with headline B.
export default function Home() {
  return <HomePage variant="a" />;
}
