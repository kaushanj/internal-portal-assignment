import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import { assertSafeMutation } from "@/lib/csrf";
import { taskRepository } from "@/lib/repositories/task.repository";
import { updateTaskSchema } from "@/lib/validators/task";
import { validationError } from "@/lib/validators/common";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const csrfError = assertSafeMutation(request);
  if (csrfError) return csrfError;

  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const task = await taskRepository.findByIdForOwner(id, session.userId);
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const updatedTask = await taskRepository.update(id, parsed.data);
    return NextResponse.json({ task: updatedTask });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const csrfError = assertSafeMutation(request);
  if (csrfError) return csrfError;

  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const task = await taskRepository.findByIdForOwner(id, session.userId);
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  await taskRepository.delete(id);
  return NextResponse.json({ ok: true });
}
