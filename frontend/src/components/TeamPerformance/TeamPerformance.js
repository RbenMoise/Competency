import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LOGO from "../../assets/nock j.png";
import LoadingSpinner from "../SupDash/Loading Spinner";
import AuthContext from "../context/AuthContext";
import "./TeamPerformance.css";

export default function TeamPerformance() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!user || user.role !== "supervisor") {
          setError("Access restricted to supervisors");
          setIsLoading(false);
          return;
        }

        const teamRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/team`,
          { withCredentials: true }
        );
        setSubmissions(
          teamRes.data.users.flatMap((user) =>
            user.submissions.map((sub) => ({
              ...sub,
              submitter: { name: user.name, occupation: user.occupation },
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
  }, [navigate, user]);

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

  const disciplines = [
    ...new Set(submissions.flatMap((sub) => Object.keys(sub.current || {}))),
  ].sort();

  const employeeData = submissions.reduce((acc, sub) => {
    const { name } = sub.submitter;
    const key = name;
    if (
      !acc[key] ||
      new Date(sub.submittedAt) > new Date(acc[key].submittedAt)
    ) {
      const scores = {};
      let total = 0;
      let count = 0;
      Object.entries(sub.current || {}).forEach(([disc, score]) => {
        const numScore = Number(score);
        if (!isNaN(numScore)) {
          scores[disc] = numScore;
          total += numScore;
          if (numScore > 0) count += 1;
        }
      });
      const average = count > 0 ? (total / count).toFixed(2) : "-";
      acc[key] = { name, scores, total, average, submittedAt: sub.submittedAt };
    }
    return acc;
  }, {});

  const disciplineAverages = disciplines.reduce((acc, disc) => {
    const scores = submissions
      .map((sub) => Number(sub.current[disc]) || 0)
      .filter((score) => score > 0);
    acc[disc] = {
      average:
        scores.length > 0
          ? (
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            ).toFixed(2)
          : "-",
      sum:
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0).toFixed(2)
          : "-",
    };
    return acc;
  }, {});

  const totalScores = Object.values(employeeData).map((emp) => emp.total);
  const averageTotalScore =
    totalScores.length > 0
      ? (
          totalScores.reduce((sum, score) => sum + score, 0) /
          totalScores.length
        ).toFixed(2)
      : "-";
  const sumTotalScore =
    totalScores.length > 0
      ? totalScores.reduce((sum, score) => sum + score, 0).toFixed(2)
      : "-";
  const totalAverages = Object.values(employeeData).map(
    (emp) => Number(emp.average) || 0
  );
  const averageOfAverages =
    totalAverages.length > 0
      ? (
          totalAverages.reduce((sum, avg) => sum + avg, 0) /
          totalAverages.length
        ).toFixed(2)
      : "-";
  const sumOfAverages =
    totalAverages.length > 0
      ? totalAverages.reduce((sum, avg) => sum + avg, 0).toFixed(2)
      : "-";

  return (
    <div className="team-performance-container">
      <header className="modern-header">
        {!isMobile && (
          <div className="modern-logo">
            <div className="logo-placeholder">
              <img className="logo-icon" src={LOGO} alt="logo" />
              <span className="logo-text">Upstream</span>
            </div>
          </div>
        )}
        <Link className="dashlink" to="/supDash">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="8" height="8" rx="2" fill="#000000" />
            <rect x="14" y="14" width="8" height="8" rx="2" fill="#000000" />
            <path
              d="M12 6V12M12 12V18M12 12H18M12 12H6"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
              {disciplines.map((disc) => (
                <th key={disc}>{disc}</th>
              ))}
              <th>Total Score</th>
              <th>Average Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(employeeData).map((emp) => (
              <tr key={emp.name}>
                <td>{emp.name}</td>
                {disciplines.map((disc) => (
                  <td key={disc}>{emp.scores[disc] || "-"}</td>
                ))}
                <td>{emp.total}</td>
                <td>{emp.average}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <strong>Average</strong>
              </td>
              {disciplines.map((disc) => (
                <td key={disc}>{disciplineAverages[disc].average}</td>
              ))}
              <td>{averageTotalScore}</td>
              <td>{averageOfAverages}</td>
            </tr>
            <tr>
              <td>
                <strong>Sum</strong>
              </td>
              {disciplines.map((disc) => (
                <td key={disc}>{disciplineAverages[disc].sum}</td>
              ))}
              <td>{sumTotalScore}</td>
              <td>{sumOfAverages}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
