const PRIORITY_COLORS = {
  Baja: "#059669",
  Media: "#d97706",
  Alta: "#ea580c",
  Crítica: "#dc2626",
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString("es-AR") : "—");

export default function TaskList({ tasks, onEdit, onFinish, onDelete }) {
  if (tasks.length === 0) {
    return (
      <p className="empty">
        Todavía no hay tareas. Creá la primera con el formulario.
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Proyecto</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Resumen</th>
            <th>Prioridad</th>
            <th>Informador</th>
            <th>Asignada a</th>
            <th>Sprint</th>
            <th>Creación</th>
            <th>Cierre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const finished = t.status === "Finalizada";
            return (
              <tr key={t.id} className={finished ? "done" : ""}>
                <td>{t.id}</td>
                <td>{t.project_name}</td>
                <td>{t.activity_type}</td>
                <td>{t.status}</td>
                <td title={t.description || ""}>{t.summary}</td>
                <td>
                  <span
                    className="badge"
                    style={{ background: PRIORITY_COLORS[t.priority] || "#6b7280" }}
                  >
                    {t.priority}
                  </span>
                </td>
                <td>{t.reporter}</td>
                <td>{t.assignee || "—"}</td>
                <td>{t.sprint || "—"}</td>
                <td>{fmt(t.created_at)}</td>
                <td>{fmt(t.closed_at)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => onEdit(t)}
                      disabled={finished}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => onFinish(t.id)}
                      disabled={finished}
                    >
                      Finalizar
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(t)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
