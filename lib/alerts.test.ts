import { describe, expect, it } from "vitest";
import { isReopenAlertProgram, validateAlert } from "./alerts";

describe("reopening alerts", () => {
  it("are offered only for programs between seasons", () => {
    expect(isReopenAlertProgram("scottsdale")).toBe(true);
    expect(isReopenAlertProgram("phoenix")).toBe(false);
  });

  it("need a plausible email and consent before anything is sent", () => {
    expect(validateAlert("", false)).toEqual({
      email: "Enter your email address.",
      consent: "Tick the box so we may email you about the reopening.",
    });
    expect(validateAlert("not-an-email", true)).toEqual({ email: "That email address doesn't look right." });
    expect(validateAlert(`${"a".repeat(250)}@x.io`, true).email).toBeDefined();
    expect(validateAlert("  pat@example.com ", true)).toEqual({});
  });
});
