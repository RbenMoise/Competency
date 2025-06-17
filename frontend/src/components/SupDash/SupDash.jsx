import React, { useState, useRef, useEffect } from "react";
import LOGO from "../../assets/nock j.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./SupDash.css";
import LoadingSpinner from "./Loading Spinner";

export default function SupDash() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotifDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/api/notifications/${notificationId}/read`,
        // `http://localhost:4000/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data first
        const userRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/auth/me`,
          // "http://localhost:4000/api/auth/me",
          { withCredentials: true }
        );
        const userData = userRes.data.user;
        setUser(userData);

        if (userData.role !== "supervisor") {
          setError("Access restricted to supervisors");
          setIsLoading(false);
          return;
        }

        // Fetch team data only if supervisor
        const teamRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/team`,
          // "http://localhost:4000/api/team",
          { withCredentials: true }
        );
        setSubmissions(
          teamRes.data.users.flatMap((user) =>
            user.submissions.map((sub) => ({
              ...sub,
              submitter: { name: user.name, email: user.email },
            }))
          )
        );
        setSummary(teamRes.data.summary);
        setNotifications(teamRes.data.notifications || []);
        setIsLoading(false);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to load dashboard data");
        setIsLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };
    fetchUserData();

    // Poll for updates every 5 minutes
    const interval = setInterval(fetchUserData, 300000);
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
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
    return <LoadingSpinner />;
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const nameParts = user.name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0];

  const pendingReviews = submissions
    .filter((sub) => sub.status === "pending")
    .slice(0, 3);
  const completedReviews = submissions
    .filter((sub) => sub.status === "approved")
    .slice(0, 3);

  return (
    <div className="dashboard-container">
      <header className="modern-header">
        <div className="modern-logo">
          <div className="logo-placeholder">
            <img className="logo-icon" src={LOGO} alt="logo" />
            <span className="logo-text">Energizing Kenya</span>
          </div>
        </div>
        <div className="header-right">
          <div className="notification-container" ref={notifRef}>
            <div className="notification-bell" onClick={toggleNotifDropdown}>
              🔔{" "}
              {notifications.length > 0 && (
                <span className="notification-count">
                  {notifications.length}
                </span>
              )}
            </div>
            <div
              className={`notification-dropdown ${isNotifOpen ? "open" : ""}`}
            >
              {notifications.length === 0 ? (
                <div className="notification-empty">No new notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} className="notification-item">
                    <p>{notif.message}</p>
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="mark-read-button"
                    >
                      Mark as Read
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
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
              <Link
                to="/logout"
                onClick={handleLogout}
                className="dropdown-item logout"
              >
                Log Out
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="dashboard-header">
        <h1>Competency Assessment</h1>
        <h2>Supervisor Dashboard</h2>
        <div className="welcome-message">
          Welcome, <span className="user-name">{user.name}</span>
          <p>Manage and review competency assessments for your team members.</p>
        </div>
        <div className="department-info">
          Department: <span className="highlight">Upstream</span> • Team Size:{" "}
          <span className="highlight">{summary.totalUsers} employee(s)</span>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon pending"></div>
              <h3>Pending Reviews</h3>
            </div>
            <div className="stat-value">{summary.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon completed"></div>
              <h3>Completed Reviews</h3>
            </div>
            <div className="stat-value">{summary.approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon total"></div>
              <h3>Total Team Assessments</h3>
            </div>
            <div className="stat-value">
              {summary.pending + summary.approved + summary.rejected}
            </div>
          </div>
        </div>
        <div className="actions-section">
          <Link to="/employeeAssessments">
            <button className="action-button">View All Assessments</button>
          </Link>
        </div>
        <div className="reviews-section">
          <div className="review-card">
            <h3 className="review-title">Pending Reviews</h3>
            {pendingReviews.length === 0 ? (
              <div className="empty-state">No pending reviews</div>
            ) : (
              <ul className="review-list">
                {pendingReviews.map((sub) => (
                  <li key={sub._id} className="review-item">
                    {sub.submitter.name} - Submitted at{" "}
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="review-card">
            <h3 className="review-title">Recently Completed Reviews</h3>
            {completedReviews.length === 0 ? (
              <div className="empty-state">No completed reviews</div>
            ) : (
              <ul className="review-list">
                {completedReviews.map((sub) => (
                  <li key={sub._id} className="review-item">
                    {sub.submitter.name} - Approved at{" "}
                    {new Date(
                      sub.approvedAt || sub.submittedAt
                    ).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
