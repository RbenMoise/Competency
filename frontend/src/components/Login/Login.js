import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
// import axios from "axios";
import LoadingSpinner from "../SupDash/Loading Spinner";
import AuthContext from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(form);
      console.log("Login response:", user);
      if (user.role === "employee") {
        navigate("/employee");
      } else if (user.role === "supervisor") {
        navigate("/supervisor");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Logging in..." />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <div className="accent-line"></div>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="inpput-group">
            <input
              name="email"
              type="email"
              placeholder=" "
              onChange={handleChange}
              required
              className="form-input"
              disabled={isLoading}
            />
            <label className="input-label">Email Address</label>
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
              disabled={isLoading}
            />
            <label className="input-label">Password</label>
            <div className="input-highlight"></div>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Continue</span>
                <div className="button-icon">→</div>
              </>
            )}
          </button>
          <div className="signup-redirect">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
