const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.static("public"));
// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));
// ✅ Task Model\
const Task = require("./models/Task");
// ✅ Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL, pass: process.env.PASS },
});
// ======================================================= // ⏰ CRON: Send Emails Daily at 8:00 AM IST // =======================================================
cron.schedule("30 2 * * *", async () => {
  console.log("⏰ Cron triggered (8 AM IST)");
  const today = new Date().toLocaleDateString("en-CA");
  console.log("📅 Today:", today);
  try {
    // Only fetch tasks not already sent
    const tasks = await Task.find({ date: today, sent: false });
    console.log("📌 Tasks found:", tasks.length);
    for (const task of tasks) {
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: task.email,
          subject: "📌 Study Reminder",
          text: `Hello!\n\n📚 Task: ${task.title}\n📅 Date: ${task.date}\n\nStay consistent 🚀`,
        });
        console.log("✅ Email sent:", info.response);
        // Mark as sent
        task.sent = true;
        await task.save();
      } catch (err) {
        console.error("❌ Email error:", err);
      }
    }
  } catch (err) {
    console.error("❌ Cron error:", err);
  }
});
// ======================================================= // 🔁 CRON: Reset 'sent' flag at midnight IST // =======================================================
cron.schedule("30 18 * * *", async () => {
  console.log("🔄 Resetting sent status");
  try {
    await Task.updateMany({}, { sent: false });
    console.log("✅ Reset complete");
  } catch (err) {
    console.error("❌ Reset error:", err);
  }
});
// ======================================================= // 🚀 Routes // =======================================================
app.use("/api/tasks", require("./routes/taskRoutes"));
// ======================================================= // 🚀 Start Server // =======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
