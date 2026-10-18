// Plain-language statement pages (privacy, accessibility): headed sections with readable line length.
export function StatementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line py-8 first:border-0 first:pt-0">
      <h2 className="text-2xl">{title}</h2>
      <div className="flex flex-col gap-3 text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </section>
  );
}
