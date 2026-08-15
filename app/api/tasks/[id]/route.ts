import { TaskStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import {
  taskRepository,
  type UpdateTaskInput,
} from "@/lib/repositories/task.repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const task = await taskRepository.findByIdForOwner(id, session.userId);
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data: UpdateTaskInput = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty." },
          { status: 400 }
        );
      }
      data.title = title;
    }

    if (body.description !== undefined) {
      data.description = String(body.description).trim();
    }

    if (body.status !== undefined) {
      const status = String(body.status);
      if (!isTaskStatus(status)) {
        return NextResponse.json(
          { error: "Invalid task status." },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    const updatedTask = await taskRepository.update(id, data);
    return NextResponse.json({ task: updatedTask });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
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
