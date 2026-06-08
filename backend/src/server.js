import "dotenv/config";
import cors from "cors";
import express from "express";
import { ensureSchema, pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/todos", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, completed, created_at, updated_at FROM todos ORDER BY created_at DESC"
    );
    res.json(rows.map(toTodo));
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query("INSERT INTO todos (title) VALUES (:title)", { title });
    const [rows] = await pool.query(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = :id",
      { id: result.insertId }
    );

    return res.status(201).json(toTodo(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updates = {};

    if (Object.hasOwn(req.body, "title")) {
      const title = String(req.body.title ?? "").trim();
      if (!title) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = title;
    }

    if (Object.hasOwn(req.body, "completed")) {
      updates.completed = Boolean(req.body.completed);
    }

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid todo id" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const setClause = Object.keys(updates).map((key) => `${key} = :${key}`).join(", ");
    const [result] = await pool.query(`UPDATE todos SET ${setClause} WHERE id = :id`, {
      id,
      ...updates
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const [rows] = await pool.query(
      "SELECT id, title, completed, created_at, updated_at FROM todos WHERE id = :id",
      { id }
    );

    return res.json(toTodo(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid todo id" });
    }

    const [result] = await pool.query("DELETE FROM todos WHERE id = :id", { id });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

function toTodo(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Todo API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });
