import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotesList } from "./notes-list";

describe("NotesList", () => {
  it("names each note's kind in text, not only by color", () => {
    render(
      <NotesList
        notes={[
          { kind: "warning", code: "APPROVAL_FIRST", text: "Wait for approval." },
          { kind: "blocker", code: "PHX_MIN", text: "Phoenix requires at least 250 sq ft." },
          { kind: "info", code: "PHX_TIMELINE", text: "Review can take up to 3 weeks." },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "Warning: Wait for approval.",
      "Blocker: Phoenix requires at least 250 sq ft.",
      "Note: Review can take up to 3 weeks.",
    ]);
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<NotesList notes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
