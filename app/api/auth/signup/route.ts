import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { assertSameOrigin, setCsrfCookie } from "@/lib/csrf";
import { userRepository } from "@/lib/repositories/user.repository";
import { signupSchema } from "@/lib/validators/auth";
import { validationError } from "@/lib/validators/common";

export async function POST(request: NextRequest) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { email, name, password } = parsed.data;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      name,
      password: hashed,
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);
    await setCsrfCookie();

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
