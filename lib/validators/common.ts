import { NextResponse } from "next/server";
import { z } from "zod";

export function validationError(error: z.ZodError) {
  return NextResponse.json(
    { error: error.issues[0]?.message || "Invalid request." },
    { status: 400 }
  );
}
