import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "csrf";
export const CSRF_HEADER = "x-csrf-token";

export function createCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export async function setCsrfCookie(token = createCsrfToken()) {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return token;
}

export async function clearCsrfCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE);
}

export async function ensureCsrfCookie() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  return setCsrfCookie();
}

function hostsMatch(urlValue: string, host: string | null) {
  if (!host) return false;
  try {
    return new URL(urlValue).host === host;
  } catch {
    return false;
  }
}

/** Reject cross-site mutating requests. */
export function assertSameOrigin(request: NextRequest) {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    if (!hostsMatch(origin, host)) {
      return forbidden("Invalid request origin.");
    }
    return null;
  }

  if (referer) {
    if (!hostsMatch(referer, host)) {
      return forbidden("Invalid request origin.");
    }
    return null;
  }

  return forbidden("Missing request origin.");
}

/**
 * Double-submit CSRF check:
 * cookie value must match X-CSRF-Token header.
 */
export function assertCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return forbidden("Invalid CSRF token.");
  }

  return null;
}

export function assertSafeMutation(request: NextRequest) {
  return assertSameOrigin(request) || assertCsrf(request);
}

function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}
