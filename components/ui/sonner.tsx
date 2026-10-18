"use client";

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// DESIGN §6 toast: bottom center, 4 s; sonner announces through an aria-live region.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" aria-hidden="true" />,
        info: <InfoIcon className="size-5 text-ink-muted" aria-hidden="true" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" aria-hidden="true" />,
        error: <OctagonXIcon className="size-5 text-error" aria-hidden="true" />,
        loading: <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-card !border-line !bg-paper !text-ink !shadow-card !font-sans",
          description: "!text-ink-muted",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
