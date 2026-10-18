// Lets any control (the mobile menu, a footer link) open the Proof drawer without prop drilling.
export const PROOF_OPEN_EVENT = "ss:proof-open";

export function openProof(): void {
  window.dispatchEvent(new Event(PROOF_OPEN_EVENT));
}
