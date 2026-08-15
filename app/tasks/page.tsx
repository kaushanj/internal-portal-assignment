"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(
    null
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("TODO");

  async function load() {
    setError("");
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    const meData = await meRes.json();
    setUser(meData.user);

    const tasksRes = await fetch("/api/tasks");
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

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    closeDrawer();
  }

  async function onStatusChange(id: string, status: string) {
    setError("");
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not update status.");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? json.task : t)));
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

  function closeDrawer() {
    if (saving) return;
    setDrawerMode(null);
    setSelectedTaskId(null);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTaskId) return;

    setSaving(true);
    setError("");
    const res = await fetch(`/api/tasks/${selectedTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    closeDrawer();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setError("");
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Could not delete task.");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
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
      <header className="header">
        <div className="header-inner">
          <h1>Internal Portal</h1>
          <div>
            <span className="who">{user?.name}</span>{" "}
            <button className="light" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        {error ? <p className="error">{error}</p> : null}

        <div className="page-heading">
          <div>
            <h1>Tasks</h1>
            <p className="muted">{tasks.length} total</p>
          </div>
          <button type="button" onClick={startCreate}>
            Create task
          </button>
        </div>

        <div className="box">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet.</p>
              <button type="button" onClick={startCreate}>
                Create your first task
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="title-cell" title={task.title}>
                        {task.title}
                      </td>
                      <td
                        className="description-cell"
                        title={task.description || undefined}
                      >
                        {task.description || "—"}
                      </td>
                      <td>
                        <select
                          className="table-status"
                          aria-label={`Status for ${task.title}`}
                          value={task.status}
                          onChange={(event) =>
                            onStatusChange(task.id, event.target.value)
                          }
                        >
                          <option value="TODO">To do</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => startEdit(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-button delete"
                            type="button"
                            onClick={() => onDelete(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {drawerMode ? (
        <div className="drawer-layer">
          <button
            className="drawer-backdrop"
            type="button"
            aria-label="Close task panel"
            onClick={closeDrawer}
          />
          <aside className="drawer" aria-label={`${drawerMode} task`}>
            <div className="drawer-header">
              <div>
                <h2>{drawerMode === "create" ? "Create task" : "Edit task"}</h2>
                <p className="muted">
                  {drawerMode === "create"
                    ? "Add a task to your list."
                    : "Update the task details."}
                </p>
              </div>
              <button
                className="close-button"
                type="button"
                aria-label="Close"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <form
              className="drawer-form"
              onSubmit={drawerMode === "create" ? onCreate : saveEdit}
            >
              <div>
                <label>
                  Title
                  <input
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={formDescription}
                    onChange={(event) =>
                      setFormDescription(event.target.value)
                    }
                  />
                </label>

                <label>
                  Status
                  <select
                    value={formStatus}
                    onChange={(event) => setFormStatus(event.target.value)}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </label>
              </div>

              <div className="drawer-actions">
                <button
                  className="secondary"
                  type="button"
                  onClick={closeDrawer}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : drawerMode === "create"
                      ? "Create task"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
