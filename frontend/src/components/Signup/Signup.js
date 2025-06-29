import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";
import axios from "axios";

export default function Signup() {
  // Whitelisted email domains
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

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    occupation: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user types
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Check if email is whitelisted
    if (!emailWhitelist.includes(form.email.toLowerCase())) {
      setError("Only authorized email addresses can sign up");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        form
      );
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup error");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Create Your Account.</h2>
          <div className="accent-line"></div>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="inpput-group">
            <input
              name="name"
              placeholder=" "
              onChange={handleChange}
              required
              className="form-input"
            />
            <label className="input-label">Full Name</label>
            <div className="input-highlight"></div>
          </div>

          <div className="inpput-group">
            <input
              name="email"
              type="email"
              placeholder=" example@nockenya.co.ke "
              onChange={handleChange}
              required
              className="form-input"
            />
            <label className="input-label"></label>
            <div className="input-highlight"></div>
          </div>

          <div className="inpput-group">
            <input
              name="password"
              type="password"
              placeholder=" "
              onChange={handleChange}
              required
              className="form-input"
            />
            <label className="input-label">Password</label>
            <div className="input-highlight"></div>
          </div>

          <div className="inpput-group">
            <input
              name="occupation"
              placeholder=" "
              onChange={handleChange}
              required
              className="form-input"
            />
            <label className="input-label">Position</label>
            <div className="input-highlight"></div>
          </div>

          <div className="select-group">
            <label>Role</label>
            <select name="role" onChange={handleChange} className="role-select">
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <button type="submit" className="signup-button">
            <span>Get Started</span>
            <div className="button-icon">→</div>
          </button>
        </form>

        <div className="login-redirect">
          Already registered?{" "}
          <Link to="/login" className="login-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}