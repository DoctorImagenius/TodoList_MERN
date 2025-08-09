// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Middleware to parse JSON data
app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));

// 1️⃣ Connect to MongoDB
(async () => {
  try {
    await mongoose.connect("mongodb+srv://imagenius:imagenius1001@tododb.je4uyft.mongodb.net/?retryWrites=true&w=majority&appName=tododb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
})();

// 2️⃣ Create Schema & Model
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toISOString().split("T")[0]; // YYYY-MM-DD
    },
  },
  time: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toTimeString().split(" ")[0]; // HH:MM:SS
    },
  },
});

const Todo = mongoose.model("Todo", todoSchema);

// 3️⃣ CRUD Routes

// ➕ Create a new Todo
app.post("/todos", async (req, res) => {
  try {
    const newTodo = await Todo.create(req.body); // Creates & saves in one step
    res.send(newTodo);
  } catch (err) {
    res.send({ error: err.message });
  }
});

// 📄 Get All Todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.send(todos);
  } catch (err) {
    res.send({ error: err.message });
  }
});

// 📄 Get Single Todo by ID
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.send({ message: "Todo not found" });
    res.send(todo);
  } catch (err) {
    res.send({ error: err.message });
  }
});

// ✏️ Update Todo by ID
app.put("/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return updated document
    );
    if (!updatedTodo) return res.send({ message: "Todo not found" });
    res.send(updatedTodo);
  } catch (err) {
    res.send({ error: err.message });
  }
});

// 🗑️ Delete Todo by ID
app.delete("/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.send({ message: "Todo not found" });
    res.send({ message: "Todo deleted successfully" });
  } catch (err) {
    res.send({ error: err.message });
  }
});

// Serve React App for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 4️⃣ Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});