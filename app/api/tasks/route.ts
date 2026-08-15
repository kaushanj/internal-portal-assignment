import { TaskStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import { taskRepository } from "@/lib/repositories/task.repository";

function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const tasks = await taskRepository.findByOwner(session.userId);
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const status = String(body.status ?? TaskStatus.TODO);

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!isTaskStatus(status)) {
      return NextResponse.json({ error: "Invalid task status." }, { status: 400 });
    }

    const task = await taskRepository.create({
      title,
      description,
      status,
      ownerId: session.userId,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
