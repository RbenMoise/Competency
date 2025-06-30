const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const scoreRoutes = require("./routes/scoreRoute");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://nockcompetency-qnwln.ondigitalocean.app",
      "https://nockcompetency-qad9e.ondigitalocean.app",
      "https://nockcompetency.co.ke"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 12 * 60 * 60, // 12 hours
    }),
    cookie: {
      secure: false, // Set to false for local development
      httpOnly: true,
      sameSite: "lax", // lax for local, none for production
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
      path: "/",
    },
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Debug middleware to log session data
app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", req.session.user);
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", scoreRoutes);

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
