import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  ownerId: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export class TaskRepository {
  findByOwner(ownerId: string) {
    return prisma.task.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
    });
  }

  findByIdForOwner(id: string, ownerId: string) {
    return prisma.task.findFirst({
      where: { id, ownerId },
    });
  }

  create(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? "",
        status: data.status ?? TaskStatus.TODO,
        ownerId: data.ownerId,
      },
    });
  }

  update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }
}

export const taskRepository = new TaskRepository();
