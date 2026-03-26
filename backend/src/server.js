const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/users", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name, email]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at",
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
