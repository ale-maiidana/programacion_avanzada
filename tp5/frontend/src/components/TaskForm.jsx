import { useEffect, useState } from "react";

const TIPOS = ["Tarea", "Bug", "Historia", "Épica", "Subtarea"];
// "Finalizada" no está acá: se asigna con el botón Finalizar del listado
const ESTADOS = ["Por hacer", "En curso", "En revisión"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];

const EMPTY = {
  project_name: "",
  activity_type: "Tarea",
  status: "Por hacer",
  summary: "",
  description: "",
  priority: "Media",
  reporter: "",
  assignee: "",
  precondition: "",
  sprint: "",
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString("es-AR") : "");

export default function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Cuando se elige "Editar" en el listado, cargamos esa tarea en el form
  useEffect(() => {
    if (editingTask) {
      const values = {};
      for (const key of Object.keys(EMPTY)) {
        values[key] = editingTask[key] ?? "";
      }
      setForm(values);
    } else {
      setForm(EMPTY);
    }
  }, [editingTask]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit(form);
    setSaving(false);
    if (ok && !editingTask) setForm(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          Nombre del Proyecto *
          <input
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          Tipo de Actividad *
          <select
            name="activity_type"
            value={form.activity_type}
            onChange={handleChange}
          >
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Estado
          <select name="status" value={form.status} onChange={handleChange}>
            {ESTADOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Prioridad
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            {PRIORIDADES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="field full">
          Resumen *
          <input
            name="summary"
            value={form.summary}
            onChange={handleChange}
            maxLength={200}
            required
          />
        </label>

        <label className="field full">
          Descripción
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          Informador *
          <input
            name="reporter"
            value={form.reporter}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          Persona asignada
          <input
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
          />
        </label>

        <label className="field full">
          Precondición
          <textarea
            name="precondition"
            value={form.precondition}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          Sprint
          <input
            name="sprint"
            value={form.sprint}
            onChange={handleChange}
            placeholder="Ej: Sprint 1"
          />
        </label>

        <label className="field">
          Fecha de Creación
          <input
            disabled
            value={
              editingTask
                ? fmt(editingTask.created_at)
                : "Se completa automáticamente"
            }
          />
        </label>

        <label className="field">
          Fecha de Cierre
          <input
            disabled
            value={
              editingTask?.closed_at
                ? fmt(editingTask.closed_at)
                : "Se completa al finalizar"
            }
          />
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Guardando..." : editingTask ? "Guardar cambios" : "Crear tarea"}
        </button>
        {editingTask && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
