"use client";

import { CalendarPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildIcs } from "@/lib/booking/ics";
import type { SlotWindow } from "@/lib/booking/slots";

// FR-BOOK-05: the .ics file is built in the browser; nothing is sent anywhere.
export function AddToCalendar(props: {
  id: string;
  slotDate: string;
  slotWindow: SlotWindow;
  city: string;
  note: string;
}) {
  const download = () => {
    const blob = new Blob([buildIcs({ ...props, now: new Date() })], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sonoran-swap-yard-walk.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Button variant="secondary" onClick={download}>
      <CalendarPlusIcon aria-hidden="true" />
      Add to calendar
    </Button>
  );
}
