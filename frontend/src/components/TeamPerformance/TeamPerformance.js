import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LOGO from "../../assets/nock j.png";
import LoadingSpinner from "../SupDash/Loading Spinner";
import "./TeamPerformance.css";

export default function TeamPerformance() {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data first
        const userRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/auth/me`,
          {
            withCredentials: true,
          }
        );
        const userData = userRes.data.user;
        setUser(userData);

        if (userData.role !== "supervisor") {
          setError("Access restricted to supervisors");
          setIsLoading(false);
          return;
        }

        // Fetch team data
        const teamRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/team`,
          {
            withCredentials: true,
          }
        );
        setSubmissions(
          teamRes.data.users.flatMap((user) =>
            user.submissions.map((sub) => ({
              ...sub,
              submitter: {
                name: user.name,
                email: user.email,
                occupation: user.occupation,
              },
            }))
          )
        );
        setIsLoading(false);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load team performance data."
        );
        setIsLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Data is on the way..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <LoadingSpinner message="Data is on the way..." />;
  }

  const nameParts = user.name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0];

  // Get unique disciplines
  const disciplines = [
    ...new Set(submissions.flatMap((sub) => Object.keys(sub.current || {}))),
  ].sort();

  // Calculate totals and averages
  const employeeData = submissions.reduce((acc, sub) => {
    const { name, email } = sub.submitter;
    const key = `${name}-${email}`;
    if (!acc[key]) {
      acc[key] = { name, email, scores: {}, total: 0 };
    }
    Object.entries(sub.current || {}).forEach(([disc, score]) => {
      acc[key].scores[disc] = score;
      acc[key].total += score;
    });
    return acc;
  }, {});

  const disciplineAverages = disciplines.reduce((acc, disc) => {
    const scores = submissions
      .map((sub) => sub.current[disc] || 0)
      .filter((score) => score > 0);
    acc[disc] =
      scores.length > 0
        ? (
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          ).toFixed(2)
        : "-";
    return acc;
  }, {});

  return (
    <div className="team-performance-container">
      <header className="modern-header">
        <div className="modern-logo">
          <div className="logo-placeholder">
            <img className="logo-icon" src={LOGO} alt="logo" />
            <span className="logo-text">Energizing Kenya</span>
          </div>
        </div>
        <Link className="dashlink" to="/supDash">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="3" width="8" height="8" rx="1" fill="#0c0c0c" />
            <rect
              x="3"
              y="13"
              width="8"
              height="8"
              rx="1"
              fill="#0c0c0c"
              opacity="0.8"
            />
            <rect x="13" y="3" width="8" height="8" rx="1" fill="#0c0c0c" />
            <rect
              x="13"
              y="13"
              width="8"
              height="8"
              rx="1"
              fill="#0c0c0c"
              opacity="0.8"
            />
            <path d="M12 3V21" stroke="#e0e0e0" strokeWidth="1.5" />
            <path d="M3 12H21" stroke="#e0e0e0" strokeWidth="1.5" />
          </svg>
          Dashboard
        </Link>
        <div className="modern-profile" ref={dropdownRef}>
          <div className="profile-container" onClick={toggleDropdown}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p>{user.occupation}</p>
            </div>
            <div className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
              ▼
            </div>
          </div>
          <div className={`dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
            <div className="dropdown-divider"></div>
            <Link to="/logout" className="dropdown-item logout">
              Log Out
            </Link>
          </div>
        </div>
      </header>
      <h2>Team Performance Overview</h2>
      <div className="team-performance-content">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {disciplines.map((disc) => (
                <th key={disc}>{disc}</th>
              ))}
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(employeeData).map((emp) => (
              <tr key={emp.email}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                {disciplines.map((disc) => (
                  <td key={disc}>{emp.scores[disc] || "-"}</td>
                ))}
                <td>{emp.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2">
                <strong>Average</strong>
              </td>
              {disciplines.map((disc) => (
                <td key={disc}>{disciplineAverages[disc]}</td>
              ))}
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
