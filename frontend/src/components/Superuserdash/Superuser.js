import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LOGO from "../../assets/nock j.png";
import LoadingSpinner from "../SupDash/Loading Spinner";
import "./Superuser.css";

export default function SuperUserDash() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    employees: 0,
    supervisors: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/auth/me`,
          { withCredentials: true }
        );
        const userData = userRes.data.user;
        setUser(userData);

        // if (userData.role !== "super") {
        //   setError("Access restricted to super users");
        //   setIsLoading(false);
        //   return;
        // }

        const teamRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/team`,
          { withCredentials: true }
        );
        const users = teamRes.data.users;
        setAllUsers(users);
        setSubmissions(
          users.flatMap((user) =>
            user.submissions.map((sub) => ({
              ...sub,
              submitter: {
                name: user.name,
                email: user.email,
                occupation: user.occupation,
                role: user.role,
              },
            }))
          )
        );
        setSummary({
          totalUsers: users.length,
          employees: users.filter((u) => u.role === "employee").length,
          supervisors: users.filter((u) => u.role === "supervisor").length,
          pending: teamRes.data.summary.pending,
          approved: teamRes.data.summary.approved,
          rejected: teamRes.data.summary.rejected,
        });
        setIsLoading(false);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Failed to load super user dashboard data."
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

  const formatScores = (scores) => {
    if (!scores || typeof scores !== "object") return "No assessment";
    return Object.entries(scores)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

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

  return (
    <div className="super-user-container">
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
      <h2>Super User Dashboard</h2>
      <div className="super-user-content">
        <div className="summary-section">
          <h3>System Overview</h3>
          <div className="summary-stats">
            <p>
              Total Users: <strong>{summary.totalUsers}</strong>
            </p>
            <p>
              Employees: <strong>{summary.employees}</strong>
            </p>
            <p>
              Supervisors: <strong>{summary.supervisors}</strong>
            </p>
            <p>
              Pending Submissions: <strong>{summary.pending}</strong>
            </p>
            <p>
              Approved Submissions: <strong>{summary.approved}</strong>
            </p>
            <p>
              Rejected Submissions: <strong>{summary.rejected}</strong>
            </p>
          </div>
        </div>
        <div className="actions-section">
          <Link to="/employeeAssessments">
            <button className="action-button">
              Manage Employee Assessments
            </button>
          </Link>
          <Link to="/teamPerformance">
            <button className="action-button">View Team Performance</button>
          </Link>
        </div>
        <div className="users-section">
          <h3>All Users</h3>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Occupation</th>
                <th>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.occupation}</td>
                  <td>{u.submissions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="submissions-section">
          <h3>All Submissions</h3>
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Reviewed By</th>
                <th>Reviewed At</th>
                <th>Employee Scores</th>
                <th>Supervisor Scores</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.submitter.name}</td>
                  <td>
                    <span
                      className={`status-badge ${sub.status.toLowerCase()}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td>{sub.approvedBy || "-"}</td>
                  <td>
                    {sub.approvedAt
                      ? new Date(sub.approvedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{formatScores(sub.current)}</td>
                  <td>{formatScores(sub.supervisorAssessment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
