import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import { assertSafeMutation } from "@/lib/csrf";
import { taskRepository } from "@/lib/repositories/task.repository";
import { createTaskSchema } from "@/lib/validators/task";
import { validationError } from "@/lib/validators/common";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const tasks = await taskRepository.findByOwner(session.userId);
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const csrfError = assertSafeMutation(request);
  if (csrfError) return csrfError;

  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const task = await taskRepository.create({
      ...parsed.data,
      ownerId: session.userId,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
