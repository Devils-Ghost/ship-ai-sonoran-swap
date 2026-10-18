"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/analytics/client";
import { PROOF_TABS, type ProofTab } from "@/lib/proof/content";
import {
  HowItWorksSection,
  LimitsSection,
  PrivacySection,
  QualitySection,
  TimelineSection,
} from "./proof-sections";
import { TestingSection } from "./testing-section";

// FR-PROOF-02: loaded only when the drawer opens, so the timeline and report data never weigh on page loads.
export default function ProofPanel({ tab, onTab }: { tab: ProofTab; onTab: (t: ProofTab) => void }) {
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        onTab(v as ProofTab);
        track("proof_opened", { tab: v });
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <TabsList className="mx-6 flex-wrap justify-start">
        {PROOF_TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-8">
        <TabsContent value="timeline">
          <TimelineSection compact />
        </TabsContent>
        <TabsContent value="quality">
          <QualitySection />
        </TabsContent>
        <TabsContent value="testing">
          <TestingSection />
        </TabsContent>
        <TabsContent value="how">
          <HowItWorksSection />
        </TabsContent>
        <TabsContent value="limits">
          <LimitsSection />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacySection />
        </TabsContent>
        <div className="mt-8 flex flex-col gap-1 border-t border-line pt-5">
          <Link href="/insights" className="inline-flex min-h-11 w-fit items-center gap-1 font-semibold link">
            Growth insights from this site&apos;s data
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/launch-notes"
            className="inline-flex min-h-11 w-fit items-center gap-1 font-semibold link"
          >
            Full launch notes
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Tabs>
  );
}
