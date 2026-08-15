import { NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import { ensureCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  await ensureCsrfCookie();

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
    },
  });
}
