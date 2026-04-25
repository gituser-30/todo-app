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
cron.schedule("0 8 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find({ date: today });

  tasks.forEach(task => {
    transporter.sendMail({
      from: process.env.EMAIL,
      to: task.email,
      subject: "📌 Today's Task Reminder",
      text: `You planned: ${task.title}`
    });
  });

  console.log("Emails sent");
});

// Routes
app.use("/api/tasks", require("./routes/taskRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));