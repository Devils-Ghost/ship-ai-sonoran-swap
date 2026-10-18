import { cn } from "cn";
import { InfoIcon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import type { RebateNote } from "@/lib/rebates/types";

// DESIGN §6: icon and a text prefix per kind, so status never depends on color alone.
const KIND = {
  info: { Icon: InfoIcon, color: "text-ink-muted", label: "Note" },
  warning: { Icon: TriangleAlertIcon, color: "text-warning", label: "Warning" },
  blocker: { Icon: OctagonXIcon, color: "text-error", label: "Blocker" },
} as const;

export function NotesList({ notes, className }: { notes: RebateNote[]; className?: string }) {
  if (notes.length === 0) return null;
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {notes.map((note) => {
        const { Icon, color, label } = KIND[note.kind];
        return (
          <li key={note.code} data-kind={note.kind} className="flex gap-2.5 text-[0.9375rem] leading-snug">
            <Icon className={cn("mt-0.5 size-[18px] shrink-0", color)} aria-hidden="true" />
            <span>
              <span className="sr-only">{label}: </span>
              {note.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
