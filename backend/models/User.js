const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "supervisor"], default: "employee" },
  submissions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ScoreSubmission" },
  ], // Reference to score submissions
});

module.exports = mongoose.model("User", userSchema);
