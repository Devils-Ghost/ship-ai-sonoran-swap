import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import business from "@/content/business.json";

// FR-SEO-04: share image per page, the title on a desert horizon with the wordmark. Node runtime (Cache
// Components rejects edge). Satori needs plain colors, so DESIGN §2 token values are mirrored here.
const C = {
  caliche: "#f6f1e7",
  sand: "#eadfc9",
  ink: "#1f2421",
  inkMuted: "#5c6159",
  saguaro: "#2f4a35",
  terracotta: "#a4471f",
  terracottaLight: "#d9774c",
  paloVerde: "#8fa650",
} as const;

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/og/fraunces-latin-600-normal.woff")),
  readFile(join(process.cwd(), "assets/og/inter-latin-500-normal.woff")),
]);

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const title = clip(params.get("title")?.trim() || business.tagline, 90);
  const subtitle = clip(params.get("subtitle")?.trim() ?? business.oneLiner, 120);
  const [fraunces, inter] = await fonts;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: `linear-gradient(180deg, ${C.caliche} 0%, ${C.caliche} 58%, ${C.sand} 100%)`,
        position: "relative",
        fontFamily: "Inter",
        color: C.ink,
      }}
    >
      {/* Sun and two ridgelines: the desert horizon. */}
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 150,
          width: 180,
          height: 180,
          borderRadius: 999,
          background: C.terracottaLight,
          opacity: 0.85,
        }}
      />
      <svg
        width="1200"
        height="230"
        viewBox="0 0 1200 230"
        style={{ position: "absolute", left: 0, bottom: 0 }}
      >
        <path
          d="M0 120 L180 70 L320 110 L470 40 L640 100 L800 55 L980 115 L1200 60 L1200 230 L0 230 Z"
          fill={C.paloVerde}
          opacity="0.55"
        />
        <path
          d="M0 170 L220 130 L420 165 L610 120 L820 160 L1010 125 L1200 150 L1200 230 L0 230 Z"
          fill={C.saguaro}
        />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: C.terracotta }} />
        <div style={{ fontFamily: "Fraunces", fontSize: 34, color: C.saguaro }}>{business.name}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 780, marginBottom: 120 }}>
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: title.length > 50 ? 60 : 72,
            lineHeight: 1.05,
            color: C.saguaro,
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 28, lineHeight: 1.35, color: C.inkMuted }}>{subtitle}</div>}
      </div>

      {business.mode === "concept" && (
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 64,
            display: "flex",
            padding: "8px 18px",
            borderRadius: 999,
            background: C.sand,
            fontSize: 22,
            color: C.ink,
          }}
        >
          {business.disclosures.badge}
        </div>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
