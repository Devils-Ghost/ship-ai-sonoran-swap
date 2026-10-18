// SRS §7.2. The engine (P2-01) produces these; components only render them.
import type { ProgramId } from "@/lib/content/schema";

export type RebateInput = {
  sqft: number;
  trees?: number;
  removesAllGrass?: boolean;
};

export type RebateNote = {
  kind: "info" | "warning" | "blocker";
  code: string;
  text: string;
};

export type RebateResult = {
  programId: ProgramId;
  status: "open" | "unknown" | "closed";
  eligibleByArea: boolean;
  amount: number | null;
  basis: string;
  notes: RebateNote[];
  capApplied: boolean;
  minimumSqft: number | null;
  lastVerified: string;
  sourceUrl: string;
};
