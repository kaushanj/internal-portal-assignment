import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/csrf";

function getCsrfToken() {
  if (typeof document === "undefined") return "";

  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const [name, ...rest] = part.split("=");
    if (name === CSRF_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return "";
}

type ApiFetchOptions = RequestInit & {
  /** Skip CSRF header (only for GET or public bootstrap calls). */
  skipCsrf?: boolean;
};

export async function apiFetch(input: string, options: ApiFetchOptions = {}) {
  const { skipCsrf, headers, ...rest } = options;
  const nextHeaders = new Headers(headers);

  const method = (rest.method || "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (isMutation && !skipCsrf) {
    const token = getCsrfToken();
    if (token) {
      nextHeaders.set(CSRF_HEADER, token);
    }
  }

  if (rest.body && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...rest,
    headers: nextHeaders,
    credentials: "same-origin",
  });
}
