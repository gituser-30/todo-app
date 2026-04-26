const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  date: String,
  email: String,
  sent: { type: Boolean, default: false }
});
module.exports = mongoose.model("Task", taskSchema);