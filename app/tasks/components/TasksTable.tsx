import type { Task } from "../types";

type TasksTableProps = {
  tasks: Task[];
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
};

export function TasksTable({
  tasks,
  onCreate,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="box">
        <div className="empty-state">
          <p>No tasks yet.</p>
          <button type="button" onClick={onCreate}>
            Create your first task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="box">
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
                      onClick={() => onEdit(task)}
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
    </div>
  );
}
