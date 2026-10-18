"use client";

import * as React from "react";
import { cn } from "cn";
import { Tabs as TabsPrimitive } from "radix-ui";

// Underlined tabs (Proof drawer, launch notes). Active tab: saguaro text + terracotta rule.
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px inline-flex min-h-11 cursor-pointer items-center border-b-2 border-transparent px-3 text-[0.9375rem] font-semibold whitespace-nowrap text-ink-muted transition-colors hover:text-ink data-[state=active]:border-terracotta data-[state=active]:text-saguaro",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1", className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
