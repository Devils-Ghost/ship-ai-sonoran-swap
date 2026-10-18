import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// Required by @next/mdx (App Router). Guides use our typography: internal links go through next/link,
// external links open in a new tab and say so.
const components: MDXComponents = {
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="link">
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="link">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ),
  h2: ({ children }) => <h2 className="mt-12 mb-4 text-3xl">{children}</h2>,
  p: ({ children }) => <p className="my-4 text-lg leading-relaxed text-ink">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-4 flex list-disc flex-col gap-2 pl-6 text-lg text-ink">{children}</ul>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
