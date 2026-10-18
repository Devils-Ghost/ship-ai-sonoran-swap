import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { StatementSection } from "@/components/layout/prose-page";
import { content, isConcept } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/privacy");

// SRS §15.8 / FR-LEGAL / FR-DISC. Describes what the code actually does (see AGENTS §2.4).
export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        title="Privacy"
        lead="We keep your city, lawn size and the options you choose. We don't collect names, phone numbers, addresses or photos."
        crumbs={[{ label: "Privacy", href: "/privacy" }]}
      />
      <div className="container-page pb-16">
        <div className="max-w-3xl">
          {isConcept && (
            <p className="mb-8 rounded-card border border-line bg-sand p-5 text-ink">
              {content.business.disclosures.footer}
            </p>
          )}

          <StatementSection title="What we collect">
            <ul>
              <li>
                <strong>Your estimate:</strong> water-utility city, lawn size in square feet, how you measured
                it (map, typed or sample), project style and number of trees. We store the numbers we
                calculated from them.
              </li>
              <li>
                <strong>Yard previews:</strong> the style you picked, which image service answered, how long
                it took and whether it worked. Never the photo.
              </li>
              <li>
                <strong>Booking a demo yard walk:</strong> the date, time window and city.
              </li>
              <li>
                <strong>Anonymous events:</strong> which pages you visit and which tools you use, with a
                random session ID kept in your browser tab (not a cookie) and the campaign tag in the link you
                followed.
              </li>
              <li>
                <strong>Feedback:</strong> your message, and an email address only if you choose to give one
                and agree that we may reply.
              </li>
            </ul>
          </StatementSection>

          <StatementSection title="What we don't collect">
            <ul>
              <li>Names, phone numbers or email addresses (except the optional feedback email above).</li>
              <li>
                Your street address. Address search runs in your browser: it goes to Mapbox (or, when Mapbox
                is unavailable, to Photon) to find your home on the map and is never sent to our server. Your
                lawn outline stays in your browser too; we keep only its area.
              </li>
              <li>Map coordinates.</li>
              <li>
                The map image on the printable prep sheet. It is passed between pages inside your browser tab
                and never sent to us.
              </li>
              <li>
                Photos. A photo you upload is resized in your browser, which also removes location data, then
                sent to our image provider to create the preview. We don&apos;t store it.
              </li>
            </ul>
          </StatementSection>

          <StatementSection title="Who processes data for us">
            <ul>
              <li>Vercel: hosting.</li>
              <li>Neon: the database that stores the anonymous records above.</li>
              <li>Mapbox: the satellite map and address search.</li>
              <li>
                Photon by komoot, using OpenStreetMap data: backup address search when Mapbox is unavailable.
              </li>
              <li>
                USGS The National Map: backup aerial photos when Mapbox is unavailable. Your browser asks it
                for map tiles around the area you are viewing.
              </li>
              <li>Cloudflare Workers AI: creating yard previews from your photo.</li>
              <li>
                ntfy: sending booking alerts to the crew&apos;s phone (city, lawn size, estimated rebate and
                the booked time; nothing about you).
              </li>
            </ul>
          </StatementSection>

          <StatementSection title="Cookies and security">
            <p>
              We don&apos;t use cookies for tracking. To limit abuse, our server turns your IP address into a
              salted, one-way hash for rate limiting; the raw address is never stored.
            </p>
          </StatementSection>

          <StatementSection title="Questions">
            <p>
              Use the feedback form on our{" "}
              <Link href="/launch-notes" className="link">
                launch notes
              </Link>{" "}
              page.
            </p>
          </StatementSection>
        </div>
      </div>
    </>
  );
}
