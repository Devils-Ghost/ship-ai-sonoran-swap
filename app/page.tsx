import { content, isConcept } from "@/lib/content/load";

// placeholder: proves the deploy, the content pipeline and the concept disclosure.
// Replaced by the real home page later.
const { business } = content;

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
        {isConcept && (
          <p className="w-fit rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
            {business.disclosures.badge}
          </p>
        )}
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{business.tagline}</h1>
        <p className="max-w-prose text-lg text-pretty text-muted-foreground">{business.oneLiner}</p>
      </main>
      <footer className="mx-auto w-full max-w-3xl px-6 py-8 text-sm text-muted-foreground">
        {isConcept && <p>{business.disclosures.footer}</p>}
      </footer>
    </>
  );
}
