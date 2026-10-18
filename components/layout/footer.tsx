import Link from "next/link";
import { content, isConcept } from "@/lib/content/load";
import { FOOTER_CREDIT, FOOTER_NAV } from "@/lib/site";
import { Wordmark } from "./wordmark";

// SRS §5.2 footer: four link columns, the concept disclosure (FR-DISC) and the event credit.
export function Footer() {
  const { business } = content;
  return (
    <footer className="mt-auto bg-saguaro text-caliche">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-4">
          <Wordmark name={business.name} />
          <p className="max-w-sm text-caliche/85">{business.tagline}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 font-sans text-xs font-semibold tracking-[0.08em] text-caliche/75 uppercase">
                {col.title}
              </h2>
              <ul className="flex flex-col">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-caliche hover:underline hover:underline-offset-3"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-caliche/15">
        <div className="container-page flex flex-col gap-3 py-8 text-sm text-caliche/85">
          {isConcept && <p className="max-w-3xl">{business.disclosures.footer}</p>}
          <p>{FOOTER_CREDIT}</p>
        </div>
      </div>
    </footer>
  );
}
