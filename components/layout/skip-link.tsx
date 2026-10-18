// SRS §15.7: first focusable element; visible only when focused.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-full bg-terracotta px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
  );
}
