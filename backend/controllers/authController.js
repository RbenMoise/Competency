const User = require("../models/User");

exports.signup = async (req, res) => {
  const { name, email, password, role, occupation } = req.body;

  // Whitelisted emails (should match frontend)
  const emailWhitelist = [
    "mmaina@nockenya.co.ke",
    "mmutunga@nockenya.co.ke",
    "pkwanjau@nockenya.co.ke",
    "podhiambo@nockenya.co.ke",
    "pagumbah@nockenya.co.ke",
    "srono@nockenya.co.ke",
    "smutai@nockenya.co.ke",
    "srotich@nockenya.co.ke",
    "vmwangi@nockenya.co.ke",
    "imurunga@nockenya.co.ke",
    "jimani@nockenya.co.ke",
    "jkioko@nockenya.co.ke",
    "jikinya@nockenya.co.ke",
    "jkibii@nockenya.co.ke",
    "jatuta@nockenya.co.ke",
    "kasena@nockenya.co.ke",
    "kmosomtai@nockenya.co.ke",
    "lkoiyo@nockenya.co.ke",
    "lntipilit@nockenya.co.ke",
    "lobwogo@nockenya.co.ke",
    "amasinde@nockenya.co.ke",
    "akaranja@nockenya.co.ke",
    "ameitamei@nockenya.co.ke",
    "amulinge@nockenya.co.ke",
    "aoduor@nockenya.co.ke",
    "amutua@nockenya.co.ke",
    "aomar@nockenya.co.ke",
    "corora@nockenya.co.ke",
    "eobike@nockenya.co.ke",
    "ewanjala@nockenya.co.ke",
    "ekimburi@nockenya.co.ke",
    "emwachoni@nockenya.co.ke",
    "gosukuku@nockenya.co.ke",
    "hsonkoi@nockenya.co.ke"
  ];

  try {
    // Check if email is whitelisted
    if (!emailWhitelist.includes(email.toLowerCase())) {
      return res.status(403).json({ message: "Unauthorized email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      occupation,
    });

    // Store user in session
    req.session.user = {
      _id: newUser._id.toString(),
      name: newUser.name,
      role: newUser.role,
      occupation: newUser.occupation,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error during signup:", err);
        return res.status(500).json({ message: "Session error" });
      }
      console.log(
        "Session set after signup:",
        req.session.user,
        "Session ID:",
        req.sessionID
      );
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    // Store user in session
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      role: user.role,
      occupation: user.occupation,
    };

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error during login:", err);
        return res.status(500).json({ message: "Session error" });
      }
      console.log(
        "Session set after login:",
        req.session.user,
        "Session ID:",
        req.sessionID
      );

      return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          occupation: user.occupation,
        },
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login error", error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ message: "Logged out successfully" });
  });
};
