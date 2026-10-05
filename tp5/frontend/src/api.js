const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("No se pudo conectar con la API");
  }

  if (!res.ok) {
    let msg = "Error en la petición";
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {
      // la respuesta no traía JSON
    }
    throw new Error(msg);
  }

  return res.status === 204 ? null : res.json();
}

export const getTasks = () => request("/tasks");

export const createTask = (task) =>
  request("/tasks", { method: "POST", body: JSON.stringify(task) });

export const updateTask = (id, task) =>
  request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });

export const finishTask = (id) =>
  request(`/tasks/${id}/finish`, { method: "PATCH" });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: "DELETE" });
