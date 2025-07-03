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
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("discipline");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Department mapping configuration
  const departments = {
    "All": "General Performance",
    "Geophysics": ["geophysicist","geophysicist ", "senior geophysicist", "junior geophysicist"],
    "Geology": ["geologist","geologist ", "senior geologist", "junior geologist"],
    "Geochemistry": ["geochemist","geochemist ", "senior geochemist", "junior geochemist"],
    "Data Science": ["data scientist","data scientist ", "senior data scientist", "data analyst"],
    "Petroleum Engineering": ["petroleum engineer","petroleum engineer ", "reservoir engineer", "drilling engineer"]
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
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
          `${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/team`,
          { withCredentials: true }
        );
        
        const submissionsData = teamRes.data.users.flatMap((user) =>
          user.submissions.map((sub) => ({
            ...sub,
            submitter: { 
              name: user.name, 
              occupation: user.occupation.toLowerCase(),
              email: user.email,
              role: user.role
            },
          }))
        );
        
        setSubmissions(submissionsData);
        setFilteredSubmissions(submissionsData); // Initialize with all data
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load team performance data.");
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

  // Filter submissions by selected department
  useEffect(() => {
    if (selectedDepartment === "All") {
      setFilteredSubmissions(submissions);
    } else {
      const departmentOccupations = departments[selectedDepartment];
      const filtered = submissions.filter(sub => 
        departmentOccupations.includes(sub.submitter.occupation.toLowerCase())
      );
      setFilteredSubmissions(filtered);
    }
  }, [selectedDepartment, submissions]);

  // Performance analysis functions (now using filteredSubmissions)
  const getDisciplines = () => {
    return [...new Set(filteredSubmissions.flatMap((sub) => Object.keys(sub.current || {})))].sort();
  };

  const calculateEmployeePerformance = () => {
    return filteredSubmissions.reduce((acc, sub) => {
      const { name, occupation } = sub.submitter;
      const key = name;
      if (!acc[key] || new Date(sub.submittedAt) > new Date(acc[key].submittedAt)) {
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
        const average = count > 0 ? (total / count).toFixed(2) : 0;
        acc[key] = { 
          name, 
          occupation,
          scores, 
          total, 
          average, 
          submittedAt: sub.submittedAt,
          email: sub.submitter.email,
          role: sub.submitter.role
        };
      }
      return acc;
    }, {});
  };

  const calculateDisciplinePerformance = () => {
    const disciplines = getDisciplines();
    return disciplines.reduce((acc, disc) => {
      const scores = filteredSubmissions
        .map((sub) => Number(sub.current[disc]) || 0)
        .filter((score) => score > 0);
      
      const average = scores.length > 0 
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
        : 0;
      
      const sum = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0).toFixed(2)
        : 0;
      
      const count = scores.length;
      const min = count > 0 ? Math.min(...scores).toFixed(2) : 0;
      const max = count > 0 ? Math.max(...scores).toFixed(2) : 0;
      
      let stdDev = 0;
      if (count > 0) {
        const avg = parseFloat(average);
        const squareDiffs = scores.map(score => Math.pow(score - avg, 2));
        stdDev = Math.sqrt(squareDiffs.reduce((sum, val) => sum + val, 0) / count).toFixed(2);
      }
      
      acc[disc] = { average, sum, count, min, max, stdDev };
      return acc;
    }, {});
  };

  const getTopPerformers = () => {
    const employees = Object.values(calculateEmployeePerformance());
    return employees
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
      .slice(0, 3);
  };

  const getBottomPerformers = () => {
    const employees = Object.values(calculateEmployeePerformance());
    return employees
      .filter(emp => emp.average > 0)
      .sort((a, b) => parseFloat(a.average) - parseFloat(b.average))
      .slice(0, 3);
  };

  const getBestDisciplines = () => {
    const disciplines = calculateDisciplinePerformance();
    return Object.entries(disciplines)
      .sort(([, a], [, b]) => parseFloat(b.average) - parseFloat(a.average))
      .slice(0, 3);
  };

  const getWorstDisciplines = () => {
    const disciplines = calculateDisciplinePerformance();
    return Object.entries(disciplines)
      .filter(([, data]) => data.average > 0)
      .sort(([, a], [, b]) => parseFloat(a.average) - parseFloat(b.average))
      .slice(0, 3);
  };

  const getPerformanceTrends = () => {
    const employeeSubmissions = filteredSubmissions.reduce((acc, sub) => {
      const key = sub.submitter.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(sub);
      return acc;
    }, {});
    
    const trends = {};
    Object.entries(employeeSubmissions).forEach(([name, subs]) => {
      if (subs.length < 2) return;
      
      subs.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      
      const first = subs[0];
      const last = subs[subs.length - 1];
      
      const firstAvg = calculateAverage(first.current);
      const lastAvg = calculateAverage(last.current);
      
      trends[name] = {
        change: (lastAvg - firstAvg).toFixed(2),
        percentageChange: firstAvg > 0 
          ? (((lastAvg - firstAvg) / firstAvg) * 100).toFixed(2)
          : 'N/A'
      };
    });
    
    return trends;
  };

  const calculateAverage = (scores) => {
    if (!scores) return 0;
    const values = Object.values(scores).map(Number).filter(score => !isNaN(score));
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  // Data for rendering
  const disciplines = getDisciplines();
  const employeeData = calculateEmployeePerformance();
  const disciplineData = calculateDisciplinePerformance();
  const topPerformers = getTopPerformers();
  const bottomPerformers = getBottomPerformers();
  const bestDisciplines = getBestDisciplines();
  const worstDisciplines = getWorstDisciplines();
  const performanceTrends = getPerformanceTrends();

  if (isLoading) {
    return <LoadingSpinner message="Data is on the way..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <LoadingSpinner message="Data is on the way..." />;
  }

  const nameParts = user.name.split(" ");
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : nameParts[0][0];

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
      
      <div className="department-filter">
        <label htmlFor="department-select">Filter by Department:</label>
        <select
          id="department-select"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {Object.keys(departments).map(dept => (
            <option key={dept} value={dept}>
              {departments[dept] === "General Performance" ? "General Performance" : `${dept} Department`}
            </option>
          ))}
        </select>
        <span className="department-summary">
          Showing {filteredSubmissions.length} submissions from {selectedDepartment === "All" ? "all departments" : `the ${selectedDepartment} department`}
        </span>
      </div>

      <div className="analysis-switcher">
        <button 
          className={`switch-btn ${analysisMode === 'discipline' ? 'active' : ''}`}
          onClick={() => setAnalysisMode('discipline')}
        >
          Discipline Analysis
        </button>
        <button 
          className={`switch-btn ${analysisMode === 'employee' ? 'active' : ''}`}
          onClick={() => setAnalysisMode('employee')}
        >
          Employee Analysis
        </button>
      </div>

      <div className="performance-highlights">
        <div className="highlight-card">
          <h3>Top Performers {selectedDepartment !== "All" && `in ${selectedDepartment}`}</h3>
          <ul>
            {topPerformers.length > 0 ? (
              topPerformers.map((emp, index) => (
                <li key={emp.name}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className="score">{emp.average}</span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>
        
        <div className="highlight-card">
          <h3>Best Performing Disciplines {selectedDepartment !== "All" && `in ${selectedDepartment}`}</h3>
          <ul>
            {bestDisciplines.length > 0 ? (
              bestDisciplines.map(([disc, data], index) => (
                <li key={disc}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{disc}</span>
                  <span className="score">{data.average}</span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>
        
        <div className="highlight-card">
          <h3>Needs Improvement {selectedDepartment !== "All" && `in ${selectedDepartment}`}</h3>
          <ul>
            {bottomPerformers.length > 0 ? (
              bottomPerformers.map((emp, index) => (
                <li key={emp.name}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className="score">{emp.average}</span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>
        
        <div className="highlight-card">
          <h3>Challenging Disciplines {selectedDepartment !== "All" && `in ${selectedDepartment}`}</h3>
          <ul>
            {worstDisciplines.length > 0 ? (
              worstDisciplines.map(([disc, data], index) => (
                <li key={disc}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{disc}</span>
                  <span className="score">{data.average}</span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>
      </div>

      {analysisMode === 'discipline' ? (
        <div className="analysis-section">
          <h3>Discipline Performance Breakdown {selectedDepartment !== "All" && `for ${selectedDepartment}`}</h3>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Assessments</th>
                <th>Min</th>
                <th>Max</th>
                <th>Std Dev</th>
                <th>Total</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(disciplineData).length > 0 ? (
                Object.entries(disciplineData).map(([disc, data]) => (
                  <tr key={disc}>
                    <td>{disc}</td>
                    <td>{data.count}</td>
                    <td>{data.min}</td>
                    <td>{data.max}</td>
                    <td>{data.stdDev}</td>
                     <td>{data.sum}</td>
                      <td>{data.average}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No discipline data available for this department</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="analysis-section">
          <h3>Employee Performance Breakdown {selectedDepartment !== "All" && `for ${selectedDepartment}`}</h3>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                {disciplines.map((disc) => (
                  <th key={disc}>{disc}</th>
                ))}
                <th>Total</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(employeeData).length > 0 ? (
                Object.values(employeeData).map((emp) => (
                  <tr key={emp.name}>
                    <td>{emp.name}</td>
                    <td>{emp.occupation}</td>
                    {disciplines.map((disc) => (
                      <td key={disc}>{emp.scores[disc] || "-"}</td>
                    ))}
                    <td>{emp.total}</td>
                    <td>{emp.average}</td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6 + disciplines.length} className="no-data">No employee data available for this department</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}