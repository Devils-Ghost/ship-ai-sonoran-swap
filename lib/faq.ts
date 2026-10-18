import { getProgram } from "@/lib/rebates/engine";
import { summarize } from "@/lib/rebates/summary";

// CONTENT §2 FAQ (also on /how-it-works with FAQPage JSON-LD). Numbers and timelines are rendered
// from rebate-programs.json, never typed (AGENTS §2.2).
export type Faq = { q: string; a: string };

export function homeFaq(): Faq[] {
  const phx = getProgram("phoenix");
  const mesa = getProgram("mesa");
  const chd = getProgram("chandler");
  const money = [phx, mesa, chd].map((p) => summarize(p).sentence).join(" ");

  return [
    { q: "How much will my city pay?", a: `${money} Use the studio to see your number.` },
    {
      q: "Do I have to remove grass before I apply?",
      a: "No, and you shouldn't. Most programs require written approval before any grass is removed.",
    },
    {
      q: "Does artificial turf count?",
      a: "Not in Mesa or Chandler: their rules exclude it. Phoenix asks you to describe your replacement landscape and recommends desert landscaping.",
    },
    {
      q: "How long does it take?",
      a: `Phoenix's review can take ${phx.approval.reviewTime ?? "a few weeks"}. Time to finish after approval: Phoenix, ${phx.approval.completeWithin}; Mesa, ${mesa.approval.completeWithin}; Chandler, ${(chd.approval.completeWithin ?? "").replace(/ unless.*$/, "")}. The swap itself usually takes a few days.`,
    },
    {
      q: "Is the AI preview what my yard will look like?",
      a: "It's a concept to help you choose a style. Your real design is drawn after a yard walk.",
    },
    {
      q: "Is Sonoran Swap a real company?",
      a: "Not yet. It's a concept business built to show how a local landscaper's website could work. The rebate information is real and linked to official city pages.",
    },
  ];
}

/** FR-RBC city FAQ (also FAQPage JSON-LD on the rebate pages, SRS §4.5). From the program record only. */
export function cityFaq(program: ReturnType<typeof getProgram>): Faq[] {
  const { city, approval, payment, howToApply } = program;
  const faqs: Faq[] = [
    { q: `How much does ${city} pay?`, a: summarize(program).sentence },
    {
      q: "When can I remove my grass?",
      a: `Only after ${city} approves your project in writing (${approval.name}).${approval.reviewTime ? ` Review time: ${approval.reviewTime}.` : ""} Grass removed before approval can cost you the whole rebate.`,
    },
  ];
  if (payment) faqs.push({ q: "How is the rebate paid?", a: payment });
  faqs.push({ q: "How do I apply?", a: howToApply });
  return faqs;
}

/** FR-HOME-11 / SRS §4.5: FAQPage structured data. */
export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
