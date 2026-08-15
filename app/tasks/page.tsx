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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
    const form = event.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.get("title"),
        description: data.get("description"),
        status: data.get("status") || "TODO",
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error || "Could not create task.");
      return;
    }

    form.reset();
    setTasks((prev) => [json.task, ...prev]);
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
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  }

  async function saveEdit(id: string) {
    setError("");
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not update task.");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? json.task : t)));
    setEditingId(null);
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

        <div className="box">
          <h2>Add task</h2>
          <form onSubmit={onCreate}>
            <div className="form-grid">
              <label>
                Title
                <input name="title" required />
              </label>
              <label>
                Status
                <select name="status" defaultValue="TODO">
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </label>
              <label className="full">
                Description
                <textarea name="description" />
              </label>
            </div>
            <button className="success" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add task"}
            </button>
          </form>
        </div>

        <div className="box">
          <h2>
            My tasks <span className="count">({tasks.length})</span>
          </h2>
          {tasks.length === 0 ? (
            <p className="muted">No tasks yet.</p>
          ) : (
            tasks.map((task) => (
            <div className={`task ${task.status}`} key={task.id}>
                {editingId === task.id ? (
                  <>
                    <label>
                      Title
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </label>
                    <div className="actions">
                      <button type="button" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="task-title">
                      <strong>{task.title}</strong>
                      <span className={`status ${task.status}`}>
                        {task.status}
                      </span>
                    </div>

                    {task.description ? (
                      <p className="task-desc">{task.description}</p>
                    ) : null}

                    <div className="task-bottom">
                      <label>
                        Status
                        <select
                          className="inline"
                          value={task.status}
                          onChange={(e) =>
                            onStatusChange(task.id, e.target.value)
                          }
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </label>

                      <div className="actions">
                        <button
                          className="secondary"
                          type="button"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => onDelete(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
