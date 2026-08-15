import { FormEvent } from "react";
import type { DrawerMode } from "../types";

type TaskDrawerProps = {
  mode: DrawerMode;
  saving: boolean;
  title: string;
  description: string;
  status: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TaskDrawer({
  mode,
  saving,
  title,
  description,
  status,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onClose,
  onSubmit,
}: TaskDrawerProps) {
  return (
    <div className="drawer-layer">
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="Close task panel"
        onClick={onClose}
      />
      <aside className="drawer" aria-label={`${mode} task`}>
        <div className="drawer-header">
          <div>
            <h2>{mode === "create" ? "Create task" : "Edit task"}</h2>
            <p className="muted">
              {mode === "create"
                ? "Add a task to your list."
                : "Update the task details."}
            </p>
          </div>
          <button
            className="close-button"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="drawer-form" onSubmit={onSubmit}>
          <div>
            <label>
              Title
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                required
                autoFocus
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
              />
            </label>

            <label>
              Status
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value)}
              >
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
          </div>

          <div className="drawer-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create task"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
