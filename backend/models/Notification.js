const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Supervisor or employee ID
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "new_submission",
      "overdue_review",
      "review_updated",
      "commit_update",
    ],
    required: true,
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScoreSubmission",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", notificationSchema);
