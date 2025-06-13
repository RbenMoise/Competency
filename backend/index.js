const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const scoreRoutes = require("./routes/scoreRoute");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "https://nockcompetency-qnwln.ondigitalocean.app",
    // origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", scoreRoutes);

// Debug middleware to log all incoming requests

// Serve static frontend files
app.use(express.static(path.join(__dirname, "./build")));

// Catch-all route (your solution)
app.get("/{*any}", (req, res) => {
  console.log(`Catch-all route hit for: ${req.url}`);
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
