import { cn } from "cn";

// DESIGN §8: each home section has an eyebrow, H2, one-sentence lead, content and one action,
// on alternating backgrounds.
const TONE = {
  caliche: "",
  sand: "bg-sand",
  saguaro: "bg-saguaro text-caliche",
} as const;

export function Section({
  id,
  tone = "caliche",
  eyebrow,
  title,
  lead,
  action,
  children,
  className,
}: {
  id: string;
  tone?: keyof typeof TONE;
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const dark = tone === "saguaro";
  return (
    <section aria-labelledby={`${id}-title`} className={cn("section-y", TONE[tone], className)}>
      <div className="container-page flex flex-col gap-10">
        <div className="flex max-w-3xl flex-col gap-4">
          {eyebrow && <p className={cn("eyebrow", dark && "text-terracotta-light")}>{eyebrow}</p>}
          <h2 id={`${id}-title`} className={dark ? "text-caliche" : undefined}>
            {title}
          </h2>
          {lead && <p className={cn("text-lead", dark && "text-caliche/85")}>{lead}</p>}
        </div>
        {children}
        {action && <div>{action}</div>}
      </div>
    </section>
  );
}
