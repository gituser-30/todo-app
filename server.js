const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"));

const Task = require("./models/Task");

// 📩 Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

// ⏰ Daily Cron Job (runs every day at 8 AM)
cron.schedule("* * * * *", async () => {
  console.log("Cron triggered");

  const today = new Date().toLocaleDateString("en-CA");
  console.log("Today:", today);

  const tasks = await Task.find({ date: today });
  console.log("Tasks found:", tasks);

  tasks.forEach(async (task) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: task.email,
      subject: "📌 Study Reminder",
      text: `Task: ${task.title}`
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email error:", error);
  }
});
});

// Routes
app.use("/api/tasks", require("./routes/taskRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));