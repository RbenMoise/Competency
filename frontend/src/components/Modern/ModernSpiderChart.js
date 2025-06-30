import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import SupervisorSpiderChart from "./SupervisorSpiderChart";
import SpiderChart from "./SpiderChart";
import Guidelines from "../Guidelines/Guidelines";
import { Link, useNavigate } from "react-router-dom";
import LOGO from "../../assets/nock j.png";
import ScoreFormManager from "../ScoreInput/ScoreFormManager";
import LoadingSpinner from "../SupDash/Loading Spinner";
import AuthContext from "../context/AuthContext";
import "./Modern.css";

const categories = [
  "Geology",
  "Geophysics",
  "Geochemistry",
  "Petroleum Engineering",
  "Project Management",
  "Renewable Energy",
  "Field Work",
  "Reporting",
  "Data Management",
];

export default function ModernSpiderChart() {
  const { user } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [dbScores, setDbScores] = useState(null);
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("chart");
  const [committed, setCommitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();




useEffect(() => {
    // Check if mobile on initial render and on resize
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);



  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        if (!user || user.role !== "employee") {
          setError("Access restricted to employees");
          setIsLoading(false);
          return;
        }

        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/auth/me`,
          {
            withCredentials: true,
          }
        );
        console.log("API Response:", res.data);
        const userData = res.data.user;

        const hasScores =
          userData.submissions &&
          userData.submissions.length > 0 &&
          userData.submissions[0].current &&
          userData.submissions[0].projected;

        if (hasScores) {
          const submission = userData.submissions[0];
          const dbCurrentScores = Object.fromEntries(
            categories.map((cat) => [cat, submission.current[cat] || 0])
          );
          const dbProjectedScores = Object.fromEntries(
            categories.map((cat) => [cat, submission.projected[cat] || 0])
          );
          const dbSupervisorScores = submission.supervisorAssessment
            ? Object.fromEntries(
                categories.map((cat) => [
                  cat,
                  submission.supervisorAssessment[cat] || 0,
                ])
              )
            : null;

          setDbScores({
            currentScores: dbCurrentScores,
            projectedScores: dbProjectedScores,
            supervisorScores: dbSupervisorScores,
            status: submission.status || "pending",
            comments: submission.approvalComments || "",
            approvedBy: submission.approvedBy || "",
            approvedAt: submission.approvedAt || null,
            committed: submission.committed || false,
          });
          setCommitted(submission.committed || false);
          setShowForm(false);
          setSubmissionMessage(
            submission.supervisorAssessment
              ? "🎉 Your supervisor has reviewed your assessment! Click 'View Supervisor Assessment!' to see the results."
              : "This Spider Chart displays your previously submitted competency assessment."
          );
          setShowSubmissionMessage(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err.response || err);
        setError(err.response?.data?.message || "Failed to load user data.");
        setIsLoading(false);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserData();


    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user, navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmission = (newScores) => {
    setShowSubmissionMessage(true);
    setSubmissionMessage("✅ Assessment submitted successfully!");
    setDbScores({
      currentScores: newScores.currentScores,
      projectedScores: newScores.projectedScores,
    });
    setIsLoadingChart(true);
    setTimeout(() => {
      setIsLoadingChart(false);
      setShowForm(false);
    }, 5500);
  };

  const toggleViewMode = (mode) => {
    if (viewMode !== mode) {
      setViewMode(mode);
      if (mode === "supervisor" && !dbScores?.supervisorScores) {
        setSubmissionMessage(
          "⏳ Your assessment is still under review by your supervisor."
        );
      } else if (mode === "supervisor") {
        setSubmissionMessage("🎉 Supervisor’s assessment available!");
      } else {
        setSubmissionMessage("📊 Viewing your submitted assessment.");
      }
      setShowSubmissionMessage(true);
    }
  };

  const handleCommitToggle = async () => {
    setIsLoading(true);
    try {
      const submissionId = user.submissions[0]._id;
      const newCommitted = !committed;
      await axios.post(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/scores/${submissionId}/commit`,
        { committed: newCommitted },
        { withCredentials: true }
      );
      setCommitted(newCommitted);
      setSubmissionMessage(
        newCommitted
          ? "✅ You’re on your way! Your supervisor has been notified."
          : "You’ve uncommitted from the feedback."
      );
      setShowSubmissionMessage(true);
    } catch (err) {
      console.error("Commit Error:", err);
      setSubmissionMessage("❌ Failed to update commitment status.");
      setShowSubmissionMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }api/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to log out.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your data..." />;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
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
    return <LoadingSpinner message="Loading your data..." />;
  }

  const nameParts = user.name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0];

  return (
    <div className="modern-chart-container">

<header className="modern-header">
        {!isMobile && (
          <div className="modern-logo">
            <div className="logo-placeholder">
              <img className="logo-icon" src={LOGO} alt="logo" />
              <span className="logo-text">Upstream</span>
            </div>
          </div>
        )}
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
            <div
              className={`dropdown-item toggle-btn ${
                viewMode === "supervisor" ? "active disabled" : ""
              }`}
              onClick={() => toggleViewMode("supervisor")}
            >
              View Supervisor Assessment
            </div>
            <div
              className={`dropdown-item toggle-btn ${
                viewMode === "chart" ? "active disabled" : ""
              }`}
              onClick={() => toggleViewMode("chart")}
            >
              View My Assessment
            </div>
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
      </header>
      <div className="modern-title-container">
        <h2 className="modern-title">Upstream Competency Mapping</h2>
        <div className="title-decoration"></div>
      </div>
      <div className="modern-guidelines-button">
        <button
          onClick={() => setShowPopup(true)}
          className="modern-button guidelines-btn"
          disabled={isLoading}
        >
          Open Competency Guidelines <span className="button-icon">📊</span>
        </button>
        {showPopup && <Guidelines onClose={() => setShowPopup(false)} />}
      </div>
      <div className="content-container">
        <div className="content">
          {showSubmissionMessage && (
            <div
              className={`submission-notification ${
                !showSubmissionMessage ? "hide" : ""
              }`}
            >
              <div className="notification-content">
                <p>{submissionMessage}</p>
                <button
                  className="close-notification"
                  onClick={() => setShowSubmissionMessage(false)}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {isLoadingChart ? (
            <LoadingSpinner message="Generating your chart..." />
          ) : showForm ? (
            <ScoreFormManager
              categories={categories}
              onScoresChange={handleSubmission}
              initialScores={dbScores}
            />
          ) : (
            <div className="chart-wrapper">
              {viewMode === "supervisor" && dbScores?.supervisorScores ? (
                <SupervisorSpiderChart
                  categories={categories}
                  currentScores={dbScores.currentScores}
                  projectedScores={dbScores.projectedScores}
                  supervisorScores={dbScores.supervisorScores}
                  status={dbScores.status}
                  approvalComments={dbScores.comments}
                  approvedBy={dbScores.approvedBy}
                  approvedAt={dbScores.approvedAt}
                  committed={committed}
                  onCommitToggle={handleCommitToggle}
                />
              ) : viewMode === "supervisor" ? (
                <p className="no-review-message">
                  ⏳ Your assessment is still under review by your supervisor.
                </p>
              ) : dbScores ? (
                <SpiderChart
                  currentScores={dbScores.currentScores}
                  projectedScores={dbScores.projectedScores}
                  categories={categories}
                />
              ) : (
                <p>No scores available to display.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
