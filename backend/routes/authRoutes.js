const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const User = require("../models/User");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", async (req, res) => {
  const userSession = req.session.user;
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", userSession);

  if (!userSession) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(userSession._id)
      .select("name email role occupation submissions")
      .populate({
        path: "submissions",
        select:
          "current projected supervisorAssessment status approvalComments submittedAt approvedAt approvedBy committed",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Fetched user for /me:", {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      occupation: user.occupation,
      submissions: user.submissions,
    });

    res.json({
      message: "User data retrieved successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        occupation: user.occupation,
        submissions: user.submissions,
      },
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

module.exports = router;
