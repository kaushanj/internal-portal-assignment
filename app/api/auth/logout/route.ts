import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { assertSafeMutation, clearCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrfError = assertSafeMutation(request);
  if (csrfError) return csrfError;

  await clearSessionCookie();
  await clearCsrfCookie();
  return NextResponse.json({ ok: true });
}
