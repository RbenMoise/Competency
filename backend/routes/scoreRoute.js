const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ScoreSubmission = require("../models/scoreSubmittion");
const Notification = require("../models/Notification");

router.post("/scores", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  const { current, projected } = req.body;

  try {
    const existingUser = await User.findById(user._id).populate("submissions");
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existingUser.submissions.length > 0) {
      return res
        .status(409)
        .json({ error: "You have already submitted scores" });
    }

    const submissionScore = await ScoreSubmission.create({
      submitter: user._id,
      current,
      projected,
      status: "pending",
    });

    existingUser.submissions.push(submissionScore._id);
    await existingUser.save();

    // Find all supervisors and create a notification for each
    const supervisors = await User.find({ role: "supervisor" });
    if (supervisors.length > 0) {
      const notificationPromises = supervisors.map((supervisor) =>
        Notification.create({
          recipient: supervisor._id,
          message: `${user.name} has submitted an assessment for review.`,
          type: "new_submission",
          submissionId: submissionScore._id,
        })
      );
      const notifications = await Promise.all(notificationPromises);
      notifications.forEach((notification) =>
        console.log("Created notification:", notification)
      );
    } else {
      console.log("No supervisors found.");
    }

    res.status(201).json({ message: "Scores submitted for approval." });
  } catch (err) {
    console.error("Score save error:", err);
    res.status(500).json({ error: "Failed to save scores." });
  }
});

router.get("/team", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  try {
    console.log("Fetching team data for user:", user._id, "Role:", user.role);
    const users = await User.find({})
      .select("name email role occupation submissions")
      .populate({
        path: "submissions",
        select:
          "current projected supervisorAssessment status submittedAt approvedAt approvalComments approvedBy committed",
      });

    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    const overdueThreshold = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    for (const member of users) {
      for (const submission of member.submissions) {
        if (submission.status === "pending") {
          pendingCount++;
          const timeDiff = new Date() - new Date(submission.submittedAt);
          if (timeDiff > overdueThreshold && !submission.overdueNotified) {
            const supervisor = await User.findOne({ role: "supervisor" });
            if (supervisor) {
              const notification = await Notification.create({
                recipient: supervisor._id,
                message: `${member.name}'s review is overdue since ${submission.submittedAt}.`,
                type: "overdue_review",
                submissionId: submission._id,
              });
              console.log("Created overdue notification:", notification);
              submission.overdueNotified = true;
              await submission.save();
            }
          }
        } else if (submission.status === "approved") {
          approvedCount++;
        } else if (submission.status === "rejected") {
          rejectedCount++;
        }
      }
    }

    const notifications = await Notification.find({
      recipient: user._id,
      isRead: false,
    })
      .populate("submissionId")
      .sort({ createdAt: -1 })
      .limit(5);
    console.log("Fetched notifications for user:", user._id, notifications);

    res.json({
      message: "User submissions retrieved successfully",
      users,
      summary: {
        totalUsers: users.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      notifications,
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

router.get("/notifications", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  try {
    const notifications = await Notification.find({
      recipient: user._id,
      isRead: false,
    })
      .populate("submissionId")
      .sort({ createdAt: -1 })
      .limit(10);
    console.log("Fetched notifications:", notifications);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification marked as read.", notification });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

router.patch("/scores/:submissionId/approve", async (req, res) => {
  const user = req.session.user;
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", user);
  if (!user || user.role !== "supervisor") {
    return res
      .status(403)
      .json({ error: "Not authorized. Supervisor access required" });
  }

  const { submissionId } = req.params;
  const { status, approvalComments, supervisorAssessment } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
  }

  try {
    const submission = await ScoreSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (submission.status !== "pending") {
      return res.status(400).json({ error: "Submission is not pending" });
    }

    submission.status = status;
    submission.approvedAt = new Date();
    submission.approvedBy = user.name;
    if (approvalComments) {
      submission.approvalComments = approvalComments;
    }
    if (status === "approved" && supervisorAssessment) {
      submission.supervisorAssessment = supervisorAssessment;
    }
    await submission.save();

    // Notify employee
    const employee = await User.findById(submission.submitter);
    if (employee) {
      const notification = await Notification.create({
        recipient: employee._id,
        message: `Your assessment has been ${status} by ${user.name}.`,
        type: "review_updated",
        submissionId: submission._id,
      });
      console.log("Employee notification created:", notification);
    }

    console.log(`Submission ${submissionId} ${status} by ${user.name}`);

    res.json({
      message: `Submission ${status} successfully`,
      submission,
    });
  } catch (err) {
    console.error("Error updating submission:", err);
    res.status(500).json({ error: "Failed to update submission" });
  }
});

router.post("/scores/:submissionId/commit", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  const { submissionId } = req.params;
  const { committed } = req.body;

  try {
    const submission = await ScoreSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.submitter.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    submission.committed = committed;
    await submission.save();

    // Notify supervisor
    const supervisors = await User.find({ role: "supervisor" });
    if (supervisors.length > 0) {
      const notificationPromises = supervisors.map((supervisor) =>
        Notification.create({
          recipient: supervisor._id,
          message: `${user.name} has ${
            committed ? "committed to" : "uncommitted from"
          } their assessment feedback.`,
          type: "commit_update",
          submissionId: submission._id,
        })
      );
      await Promise.all(notificationPromises);
    }

    res.status(200).json({ message: "Commitment status updated" });
  } catch (err) {
    console.error("Error updating commitment status:", err);
    res.status(500).json({ error: "Failed to update commitment status" });
  }
});

module.exports = router;
