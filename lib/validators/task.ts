import { TaskStatus } from "@prisma/client";
import { z } from "zod";

const taskStatusSchema = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional().default(""),
  status: taskStatusSchema.optional().default(TaskStatus.TODO),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty.").optional(),
    description: z.string().trim().optional(),
    status: taskStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    { message: "No changes provided." }
  );
