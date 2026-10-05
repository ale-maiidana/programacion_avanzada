const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Campos que vienen del formulario (created_at y closed_at los maneja la API)
const REQUIRED = ["project_name", "activity_type", "summary", "reporter"];

// "" -> null para los campos opcionales
const orNull = (v) => (v === undefined || v === "" ? null : v);

// GET /tasks -> listado
app.get("/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar las tareas" });
  }
});

// POST /tasks -> crear
app.post("/tasks", async (req, res) => {
  const b = req.body;
  const missing = REQUIRED.filter((f) => !b[f]);
  if (missing.length) {
    return res
      .status(400)
      .json({ error: `Faltan campos obligatorios: ${missing.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks
        (project_name, activity_type, status, summary, description,
         priority, reporter, assignee, precondition, sprint)
       VALUES ($1, $2, COALESCE($3, 'Por hacer'), $4, $5,
               COALESCE($6, 'Media'), $7, $8, $9, $10)
       RETURNING *`,
      [
        b.project_name,
        b.activity_type,
        orNull(b.status),
        b.summary,
        orNull(b.description),
        orNull(b.priority),
        b.reporter,
        orNull(b.assignee),
        orNull(b.precondition),
        orNull(b.sprint),
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
});

// PUT /tasks/:id -> editar
app.put("/tasks/:id", async (req, res) => {
  const b = req.body;
  const missing = REQUIRED.filter((f) => !b[f]);
  if (missing.length) {
    return res
      .status(400)
      .json({ error: `Faltan campos obligatorios: ${missing.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET
         project_name  = $1,
         activity_type = $2,
         status        = COALESCE($3, status),
         summary       = $4,
         description   = $5,
         priority      = COALESCE($6, priority),
         reporter      = $7,
         assignee      = $8,
         precondition  = $9,
         sprint        = $10
       WHERE id = $11
       RETURNING *`,
      [
        b.project_name,
        b.activity_type,
        orNull(b.status),
        b.summary,
        orNull(b.description),
        orNull(b.priority),
        b.reporter,
        orNull(b.assignee),
        orNull(b.precondition),
        orNull(b.sprint),
        req.params.id,
      ]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al editar la tarea" });
  }
});

// PATCH /tasks/:id/finish -> finalizar
app.patch("/tasks/:id/finish", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE tasks
         SET status = 'Finalizada', closed_at = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al finalizar la tarea" });
  }
});

// DELETE /tasks/:id -> eliminar
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));
