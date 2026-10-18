"use client";

import { useEffect, useRef, useState } from "react";

// SRS §5.2: sticky header shrinks 72 → 56 px and gains a hairline once the page scrolls 24 px.
// A sentinel + IntersectionObserver avoids a scroll listener on every frame.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="pointer-events-none absolute top-0 h-6 w-px" aria-hidden="true" />
      <header
        data-scrolled={scrolled || undefined}
        className="group/header sticky top-0 z-40 border-b border-transparent transition-[border-color,background-color] duration-200 data-scrolled:border-line data-scrolled:bg-caliche/95 data-scrolled:backdrop-blur-sm"
      >
        {children}
      </header>
    </>
  );
}
