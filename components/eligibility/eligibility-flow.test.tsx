import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { questionsFor } from "@/lib/eligibility/evaluate";
import { EligibilityFlow, type ProgramOption } from "./eligibility-flow";

const programs: ProgramOption[] = [
  { id: "phoenix", city: "Phoenix", hasQuestions: true, statusNote: "Phoenix status." },
  { id: "scottsdale", city: "Scottsdale", hasQuestions: false, statusNote: "Closed for now." },
];

function setup() {
  return render(
    <EligibilityFlow
      programs={programs}
      flows={{ phoenix: questionsFor("phoenix"), scottsdale: [] }}
      extras={{ phoenix: <p>Phoenix documents</p> }}
      otherCityText="Not in our data yet."
      promise="Approval first. Always. We never remove grass before approval."
    />,
  );
}

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("EligibilityFlow (SRS §12 Eligibility)", () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
  beforeEach(() => vi.stubGlobal("fetch", fetchMock));
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockClear();
  });

  it("walks Phoenix to 'Looks eligible' and stores only program, result and codes", () => {
    setup();
    click("Start the check");
    expect(screen.getByText("Question 1")).toBeTruthy();
    click("Phoenix");
    expect(screen.getByText("Question 2 of 6")).toBeTruthy();
    for (let i = 0; i < 5; i += 1) {
      const pass = screen.getAllByRole("button", { pressed: false })[0];
      if (!pass) throw new Error("no option");
      fireEvent.click(pass);
    }
    expect(screen.getByRole("heading", { name: "Looks eligible" })).toBeTruthy();
    expect(screen.getByText("Phoenix documents")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a free yard walk" }).getAttribute("href")).toBe("/book");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(String(init.body))).toEqual({
      programId: "phoenix",
      result: "likely",
      reasonCodes: [],
    });
  });

  it("removed grass → not eligible with the FR-ELIG-04 message; Back keeps answers", () => {
    setup();
    click("Start the check");
    click("Phoenix");
    click("Yes"); // owner
    click("Yes"); // utility
    click("Yes"); // healthy
    click("Yes, some or all"); // removed
    click("Yes"); // size
    expect(screen.getByRole("heading", { name: "Not eligible right now" })).toBeTruthy();
    expect(screen.getByText(/Don't remove more. Contact the city before you continue./)).toBeTruthy();

    click("Back");
    expect(screen.getByRole("button", { name: /Yes.*Your answer/ }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    click("Back");
    expect(screen.getByRole("button", { name: /Yes, some or all/ }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("Scottsdale goes straight to a status answer, never a verdict (FR-ELIG-02)", () => {
    setup();
    click("Start the check");
    click("Scottsdale");
    expect(screen.getByRole("heading", { name: /Scottsdale: check the program status/ })).toBeTruthy();
    expect(screen.getByText("Closed for now.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Another city points to the city's conservation office", () => {
    setup();
    click("Start the check");
    click("Another city");
    expect(screen.getByText("Not in our data yet.")).toBeTruthy();
  });
});
