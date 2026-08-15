"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "./components/AppHeader";
import { TaskDrawer } from "./components/TaskDrawer";
import { TasksTable } from "./components/TasksTable";
import type { DrawerMode, Task, User } from "./types";

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("TODO");

  async function load() {
    setError("");
    const meRes = await apiFetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    const meData = await meRes.json();
    setUser(meData.user);

    const tasksRes = await apiFetch("/api/tasks");
    const tasksData = await tasksRes.json();
    if (!tasksRes.ok) {
      setError(tasksData.error || "Could not load tasks.");
      setLoading(false);
      return;
    }
    setTasks(tasksData.tasks);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 2500);
    return () => clearTimeout(timer);
  }, [success]);

  function showSuccess(message: string) {
    setError("");
    setSuccess(message);
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await apiFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: formTitle,
        description: formDescription,
        status: formStatus,
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error || "Could not create task.");
      return;
    }

    setTasks((prev) => [json.task, ...prev]);
    closeDrawer(true);
    showSuccess("Task created.");
  }

  async function onStatusChange(id: string, status: string) {
    setError("");
    setSuccess("");
    const res = await apiFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not update status.");
      return;
    }
    setTasks((prev) => prev.map((task) => (task.id === id ? json.task : task)));
    showSuccess("Task status updated.");
  }

  function startEdit(task: Task) {
    setSelectedTaskId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setDrawerMode("edit");
  }

  function startCreate() {
    setSelectedTaskId(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("TODO");
    setDrawerMode("create");
  }

  function closeDrawer(force = false) {
    if (saving && !force) return;
    setDrawerMode(null);
    setSelectedTaskId(null);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTaskId) return;

    setSaving(true);
    setError("");
    setSuccess("");
    const res = await apiFetch(`/api/tasks/${selectedTaskId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: formTitle,
        description: formDescription,
        status: formStatus,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Could not update task.");
      return;
    }
    setTasks((prev) =>
      prev.map((task) => (task.id === selectedTaskId ? json.task : task))
    );
    closeDrawer(true);
    showSuccess("Task updated.");
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setError("");
    setSuccess("");
    const res = await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Could not delete task.");
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== id));
    showSuccess("Task deleted.");
  }

  async function onLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <AppHeader userName={user?.name} onLogout={onLogout} />

      <main>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <div className="page-heading">
          <div>
            <h1>Tasks</h1>
            <p className="muted">{tasks.length} total</p>
          </div>
          <button type="button" onClick={startCreate}>
            Create task
          </button>
        </div>

        <TasksTable
          tasks={tasks}
          onCreate={startCreate}
          onEdit={startEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      </main>

      {drawerMode ? (
        <TaskDrawer
          mode={drawerMode}
          saving={saving}
          title={formTitle}
          description={formDescription}
          status={formStatus}
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onStatusChange={setFormStatus}
          onClose={() => closeDrawer()}
          onSubmit={drawerMode === "create" ? onCreate : saveEdit}
        />
      ) : null}
    </>
  );
}
