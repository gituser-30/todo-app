const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Add task
router.post("/", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// Get tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

module.exports = router;