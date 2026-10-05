import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import {
  getTasks,
  createTask,
  updateTask,
  finishTask,
  deleteTask,
} from "./api.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setTasks(await getTasks());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Devuelve true si salió bien, así el formulario sabe si limpiarse
  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      setEditingTask(null);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = async (id) => {
    try {
      await finishTask(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`¿Eliminar la tarea "${task.summary}"?`)) return;
    try {
      await deleteTask(task.id);
      if (editingTask?.id === task.id) setEditingTask(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app">
      <h1>Gestor de Tareas</h1>
      <p className="subtitle">Tareas de proyectos de software</p>

      {error && <div className="error">{error}</div>}

      <section className="card">
        <h2>{editingTask ? `Editando tarea #${editingTask.id}` : "Nueva tarea"}</h2>
        <TaskForm
          editingTask={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => setEditingTask(null)}
        />
      </section>

      <section className="card">
        <h2>Listado de Tareas</h2>
        {loading ? (
          <p className="empty">Cargando...</p>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onFinish={handleFinish}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
