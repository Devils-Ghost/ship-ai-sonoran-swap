import { NextResponse, type NextRequest } from "next/server";

// SRS §4.8 A/B headline test. /?v=b is served by the prerendered /home-b page while the address bar keeps
// /?v=b, so neither variant flashes or shifts. No cookies: the variant comes only from the link.
export function proxy(request: NextRequest) {
  if (request.nextUrl.searchParams.get("v") === "b") {
    const url = request.nextUrl.clone();
    url.pathname = "/home-b";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };
