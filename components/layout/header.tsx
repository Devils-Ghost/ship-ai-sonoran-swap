import Link from "next/link";
import { Suspense } from "react";
import { MenuIcon } from "lucide-react";
import { content } from "@/lib/content/load";
import { PRIMARY_CTA, PRIMARY_NAV } from "@/lib/site";
import { ConceptBadge } from "./concept-badge";
import { HeaderCta } from "./header-cta";
import { HeaderShell } from "./header-shell";
import { ProofDrawer } from "@/components/proof/proof-drawer";
import { MobileMenu } from "./mobile-menu";
import { Wordmark } from "./wordmark";

// FR-PROOF-01: on phones the menu's "Proof" row opens the same drawer (see MobileMenu).
const PROOF = { label: "Proof", href: "#proof" };

export function Header() {
  return (
    <HeaderShell>
      <div className="container-page flex h-[72px] items-center gap-2 transition-[height] duration-200 ease-soft group-data-scrolled/header:h-14 sm:gap-4">
        <Link
          href="/"
          className="mr-auto rounded-input text-saguaro"
          aria-label={`${content.business.name} home`}
        >
          <Wordmark name={content.business.name} />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-2.5 text-[0.9375rem] font-medium whitespace-nowrap text-ink hover:bg-sand xl:px-3"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ProofDrawer className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-sand" />
          <ConceptBadge />
        </div>

        <Suspense fallback={<span className="w-0" aria-hidden="true" />}>
          <HeaderCta link={PRIMARY_CTA} />
        </Suspense>

        <div className="lg:hidden">
          {/* usePathname() is request data on dynamic routes, so Cache Components needs a boundary. */}
          <Suspense fallback={<MenuButtonFallback />}>
            <MobileMenu links={PRIMARY_NAV} extra={[PROOF]} badge={<ConceptBadge />} />
          </Suspense>
        </div>
      </div>
    </HeaderShell>
  );
}

/** Same box as the real trigger so the header doesn't shift when the menu hydrates. */
function MenuButtonFallback() {
  return (
    <span className="inline-flex size-11 items-center justify-center text-ink" aria-hidden="true">
      <MenuIcon className="size-6" />
    </span>
  );
}
