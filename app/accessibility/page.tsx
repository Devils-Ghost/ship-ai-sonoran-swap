import { PageIntro } from "@/components/layout/page-intro";
import { StatementSection } from "@/components/layout/prose-page";
import { FeedbackForm } from "@/components/proof/feedback-form";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/accessibility");

// SRS §6.16 / §15.7. Only states testing that has actually been done; update after the accessibility audit.
export default function AccessibilityPage() {
  return (
    <>
      <PageIntro
        title="Accessibility"
        lead="This site aims to meet WCAG 2.2 AA: it works with a keyboard and screen readers, respects reduced motion, and never uses color alone to carry meaning."
        crumbs={[{ label: "Accessibility", href: "/accessibility" }]}
      />
      <div className="container-page pb-16">
        <div className="max-w-3xl">
          <StatementSection title="What we built in">
            <ul>
              <li>A skip link, one main heading per page and labeled landmarks.</li>
              <li>A visible focus outline on every link, button and field.</li>
              <li>Text and button colors chosen to meet AA contrast.</li>
              <li>Status shown with icons and words, not color alone.</li>
              <li>Touch targets of at least 44 × 44 px.</li>
              <li>
                The before/after slider works with arrow keys, Home and End, and announces its position.
              </li>
              <li>Results that update as you type are announced to screen readers.</li>
              <li>Animations stop when your device asks for reduced motion.</li>
            </ul>
          </StatementSection>

          <StatementSection title="How we test">
            <p>
              Every change runs automated accessibility checks (axe) on key pages at phone and desktop widths,
              plus keyboard tests for the menu, skip link, sliders and forms. A manual screen-reader review is
              planned before launch.
            </p>
          </StatementSection>

          <StatementSection title="Known gaps">
            <ul>
              <li>
                Drawing a lawn outline on the map needs a mouse or touch. You can type your square footage or
                use the sample yard instead, with the same results.
              </li>
              <li>AI yard previews have a general description, not a plant-by-plant one.</li>
            </ul>
          </StatementSection>

          <StatementSection title="Tell us">
            <p>If something doesn&apos;t work for you, tell us here. An email is optional.</p>
          </StatementSection>
          <FeedbackForm />
        </div>
      </div>
    </>
  );
}
