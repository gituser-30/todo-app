const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  date: String,
  email: String
});

module.exports = mongoose.model("Task", taskSchema);