import { NextResponse, type NextRequest } from "next/server"

/** Name of the httpOnly refresh cookie the Express API sets (backend/src/controllers/auth.controller.ts). */
const SESSION_COOKIE = "refreshToken"
const PUBLIC_PATHS = ["/login", "/register", "/welcome"]
// surprise pages from a gift QR code: the friend who scans one has no account
const PUBLIC_PREFIXES = ["/g/"]

/**
 * Guests never see the app: on "/" they get the landing page (the address stays "/"),
 * and every other page redirects to /login before rendering.
 * This only checks that the cookie exists; RequireAuth sends people back here if it turns out to be expired.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || request.cookies.has(SESSION_COOKIE)) return NextResponse.next()
  if (pathname === "/") return NextResponse.rewrite(new URL("/welcome", request.url))
  const url = new URL("/login", request.url)
  url.searchParams.set("next", pathname + search)
  return NextResponse.redirect(url)
}

export const config = {
  // everything except the API, Next internals and files from /public (anything with an extension)
  matcher: [
    {
      source: "/((?!api/|_next/|.*\\.[^/]+$).*)",
      // Links on /login prefetch app pages while still a guest. A redirect would be cached by the router and
      // replayed right after sign-in; the prefetched shell holds no user data (RequireAuth still guards it).
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
}
