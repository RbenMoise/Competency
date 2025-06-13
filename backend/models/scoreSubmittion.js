const mongoose = require("mongoose");

const scoreSubmissionSchema = new mongoose.Schema({
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  current: {
    type: Map,
    of: Number,
    required: true,
  },
  projected: {
    type: Map,
    of: Number,
    required: true,
  },
  supervisorAssessment: {
    type: Map,
    of: Number,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: String, // Store name directly
  },
  approvalComments: {
    type: String,
  },
  committed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("ScoreSubmission", scoreSubmissionSchema);
