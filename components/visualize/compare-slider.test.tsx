import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompareSlider } from "./compare-slider";

const images = {
  before: { src: "/samples/yard-1-before.jpg", alt: "Before" },
  after: { src: "/samples/yard-1-sonoran-native.jpg", alt: "After" },
};

describe("CompareSlider (FR-VIS-07)", () => {
  it("starts at 50% and moves in 5% steps with the arrow keys", () => {
    render(<CompareSlider {...images} />);
    const slider = screen.getByRole("slider", { name: "Compare before and after" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "55");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "45");
  });

  it("jumps to the ends with Home and End and never leaves 0–100", () => {
    render(<CompareSlider {...images} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });

  it("hides the handle in Before or After mode", () => {
    render(<CompareSlider {...images} mode="after" />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.queryByText("Before")).not.toBeInTheDocument();
  });
});
