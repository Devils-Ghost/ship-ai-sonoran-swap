import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuickEstimate } from "@/components/home/quick-estimate";
import { computeEstimate } from "@/lib/estimate/estimate";
import { ResultsPanel } from "./results-panel";

const noop = vi.fn();
const panel = (estimate: ReturnType<typeof computeEstimate> | null) =>
  render(
    <ResultsPanel
      estimate={estimate}
      onTierChange={noop}
      onTreesChange={noop}
      onRemovesAllGrassChange={noop}
    />,
  );

// SRS §12 "Rebate result" states.
describe("ResultsPanel states", () => {
  it("empty: invites a measurement", () => {
    panel(null);
    expect(screen.getByText("Your rebate appears here.")).toBeInTheDocument();
  });

  it("success: shows the basis line, approval warning, source and city disclaimer", () => {
    panel(computeEstimate({ city: "phoenix", sqft: 1240, tier: "signature" }));
    expect(screen.getByText("$2.00 × 1,240 sq ft (Phoenix)")).toBeInTheDocument();
    expect(screen.getByText(/Don't remove any grass until Phoenix approves/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Residential Grass Removal Incentive, City of Phoenix/ }),
    ).toHaveAttribute("href", expect.stringMatching(/^https:\/\/www\.phoenix\.gov\//));
    expect(screen.getByText(/decided by the City of Phoenix/)).toBeInTheDocument();
    expect(screen.getByText("Illustrative concept pricing.")).toBeInTheDocument();
  });

  it("blocker: explains the minimum and offers Chandler's all-grass waiver", () => {
    panel(computeEstimate({ city: "chandler", sqft: 400, tier: "signature" }));
    expect(screen.getByText(/Below Chandler's 500 sq ft minimum/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /removing all the grass/ })).toBeInTheDocument();
  });

  it("closed: Scottsdale shows status and the official link, never an amount", () => {
    panel(computeEstimate({ city: "scottsdale", sqft: 1200, tier: "signature" }));
    expect(screen.getByText("Between seasons")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scottsdale's official page/ })).toBeInTheDocument();
    expect(screen.queryByText(/\$2\.00 ×/)).not.toBeInTheDocument();
  });

  it("not in data: still shows project and water estimates", () => {
    panel(computeEstimate({ city: "tempe", sqft: 1200, tier: "signature" }));
    expect(screen.getByText(/We don't have Tempe's program in our data yet/)).toBeInTheDocument();
    // No rebate, so project and net ranges match.
    expect(screen.getAllByText("$12,000 – $18,000")).toHaveLength(2);
    expect(screen.getByText(/27,600 gallons a year/)).toBeInTheDocument();
  });

  it("Mesa: offers the tree bonus control", () => {
    panel(computeEstimate({ city: "mesa", sqft: 1200, tier: "signature" }));
    expect(screen.getByRole("radiogroup", { name: "New low-water trees" })).toBeInTheDocument();
  });
});

describe("QuickEstimate", () => {
  it("updates the rebate from the lawn slider (FR-HOME-02)", () => {
    render(<QuickEstimate defaultSqft={1200} />);
    const slider = screen.getByRole("slider", { name: "Lawn size in square feet" });
    expect(slider).toHaveAttribute("min", "250");
    expect(slider).toHaveAttribute("max", "5000");
    expect(slider).toHaveAttribute("step", "10");
    expect(screen.getByText("$2.00 × 1,200 sq ft")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "1210" } });
    expect(screen.getByText("$2.00 × 1,210 sq ft")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "5000" } });
    expect(screen.getByText("$2.00 × 5,000 sq ft")).toBeInTheDocument();
  });

  it("reflects typed square footage", () => {
    render(<QuickEstimate defaultSqft={1200} />);
    fireEvent.change(screen.getByLabelText("Lawn (sq ft)"), { target: { value: "249" } });
    expect(screen.getByText("Phoenix requires at least 250 sq ft of grass.")).toBeInTheDocument();
  });
});
