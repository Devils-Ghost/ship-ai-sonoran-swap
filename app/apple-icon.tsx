import { ImageResponse } from "next/og";

// FR-SEO-05: 180×180 apple-touch-icon, the same mark as icon.svg at a larger size.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#2f4a35" }}>
      <svg viewBox="0 0 32 32" width="180" height="180">
        <circle cx="16" cy="13" r="6" fill="#d9774c" />
        <path
          d="M4 23c4-3.2 7.5-3.2 11 0s7 3.2 11 0c1.2-.9 1.9-1.4 2.6-1.7"
          fill="none"
          stroke="#f6f1e7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    size,
  );
}
