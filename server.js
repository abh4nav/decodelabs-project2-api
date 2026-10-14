const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());          // lets your Project 1 frontend call this API
app.use(express.json());  // parses JSON request bodies

// ---- In-memory "database" (swap for MongoDB/MySQL later) ----
let tasks = [
  { id: 1, title: "Learn Express", priority: "high", completed: false },
  { id: 2, title: "Build Project 2", priority: "medium", completed: false },
];
let nextId = 3;

const PRIORITIES = ["low", "medium", "high"];

// ---- Validation: "Never trust the client" ----
function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const { title, priority, completed } = body || {};

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
      errors.push("title is required and must be a string of 3-100 characters");
    }
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    errors.push("completed must be true or false");
  }
  return errors;
}

// ---- Routes (resources are nouns, methods are verbs) ----

app.get("/", (req, res) => {
  res.json({ message: "Tasks API is running", endpoints: ["/tasks", "/tasks/:id"] });
});

// GET /tasks  (optional filters: ?completed=true&priority=high)
app.get("/tasks", (req, res) => {
  let result = tasks;
  if (req.query.completed !== undefined) {
    result = result.filter((t) => String(t.completed) === req.query.completed);
  }
  if (req.query.priority) {
    result = result.filter((t) => t.priority === req.query.priority);
  }
  if (req.query.search) {
    const term = String(req.query.search).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(term));
  }
  res.status(200).json({ count: result.length, data: result });
});

// GET /tasks/:id
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(200).json(task);
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  const task = {
    id: nextId++,
    title: req.body.title.trim(),
    priority: req.body.priority || "medium",
    completed: false,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /tasks/:id  (update)
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });

  const errors = validateTask(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  const { title, priority, completed } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (priority !== undefined) task.priority = priority;
  if (completed !== undefined) task.completed = completed;
  res.status(200).json(task);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  tasks.splice(index, 1);
  res.status(204).send();
});

// ---- Error handling ----
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Catches bad JSON bodies and anything unexpected
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
