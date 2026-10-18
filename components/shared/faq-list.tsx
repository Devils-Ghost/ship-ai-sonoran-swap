import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { Faq } from "@/lib/faq";

// DESIGN §6 accordion as native <details>: 56 px rows and a rotating chevron with zero JavaScript, so
// the FAQ costs the home page nothing to hydrate (C1). The browser provides keyboard and screen-reader
// behavior; answers stay in the HTML for search engines either way.
export function FaqList({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={cn("w-full border-t border-line", className)}>
      {faqs.map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[1.0625rem] font-semibold text-ink transition-colors hover:text-saguaro [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDownIcon
              className="size-5 shrink-0 text-ink-muted transition-transform duration-200 ease-soft group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-[68ch] pb-5 text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
