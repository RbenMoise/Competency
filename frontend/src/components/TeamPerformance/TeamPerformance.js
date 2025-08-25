import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LOGO from "../../assets/nock j.png";
import LoadingSpinner from "../SupDash/Loading Spinner";
import AuthContext from "../context/AuthContext";
import PerformanceCharts from "./PerformanceCharts";
import "./TeamPerformance.css";

export default function TeamPerformance() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChartsDropdownOpen, setIsChartsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("discipline");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [scoreType, setScoreType] = useState("current");
  const [chartType, setChartType] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const dropdownRef = useRef(null);
  const chartsDropdownRef = useRef(null);
  const navigate = useNavigate();

  const departments = {
    "All": "General Performance",
    "Geophysics": ["geophysicist","geophysicist ",  "senior geophysicist","petro technician", "junior geophysicist", "intern (geophycist)"],
    "Geology": ["geologist","geologist ", "senior geologist","geoscience technologist (geology)", "junior geologist"],
    "Geochemistry": ["geochemist","geochemist ", "senior geochemist","geochemical laboratory technician","palynologist", "junior geochemist", "intern (geochemistry)"],
    "Data Science": ["data scientist","data scientist ", "gis technician","gis data analyst", "senior data scientist", "data analyst"],
    "Petroleum Engineering": ["petroleum engineer","petroleum engineer ", "reservoir engineer","facilities engineer","geoscience technologist (petroleum)", "drilling engineer"]
  };
  const chartTypes = [
    { value: "spider", label: "Spider Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "stackedBar", label: "Stacked Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "box", label: "Box Plot" },
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleChartsDropdown = () => {
    setIsChartsDropdownOpen(!isChartsDropdownOpen);
  };

  const selectChartType = (type) => {
    setChartType(type);
    setShowChart(true);
    setIsChartsDropdownOpen(false);
  };

  const toggleChartVisibility = () => {
    setShowChart(!showChart);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
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

        const submissionsData = teamRes.data.users.flatMap((user) =>
          user.submissions.map((sub) => ({
            ...sub,
            submitter: {
              name: user.name,
              occupation: user.occupation.toLowerCase(),
              email: user.email,
              role: user.role,
            },
          }))
        );

        setSubmissions(submissionsData);
        setFilteredSubmissions(submissionsData);
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
      if (
        chartsDropdownRef.current &&
        !chartsDropdownRef.current.contains(event.target)
      ) {
        setIsChartsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate, user]);

  useEffect(() => {
    if (selectedDepartment === "All") {
      setFilteredSubmissions(submissions);
    } else {
      const departmentOccupations = departments[selectedDepartment];
      const filtered = submissions.filter((sub) =>
        departmentOccupations.includes(sub.submitter.occupation.toLowerCase())
      );
      setFilteredSubmissions(filtered);
    }
  }, [selectedDepartment, submissions]);

  const getDisciplines = () => {
    return [
      ...new Set(
        filteredSubmissions.flatMap((sub) => Object.keys(sub.current || {}))
      ),
    ].sort();
  };

  const calculateEmployeePerformance = () => {
    return filteredSubmissions.reduce((acc, sub) => {
      const { name, occupation, email, role } = sub.submitter;
      const key = name;
      if (
        !acc[key] ||
        new Date(sub.submittedAt) > new Date(acc[key].submittedAt)
      ) {
        const currentScores = {};
        const projectedScores = {};
        const supervisorScores = {};
        let currentTotal = 0,
          projectedTotal = 0,
          supervisorTotal = 0;
        let currentCount = 0,
          projectedCount = 0,
          supervisorCount = 0;

        Object.entries(sub.current || {}).forEach(([disc, score]) => {
          const numScore = Number(score);
          if (!isNaN(numScore)) {
            currentScores[disc] = numScore;
            currentTotal += numScore;
            if (numScore > 0) currentCount += 1;
          }
        });

        Object.entries(sub.projected || {}).forEach(([disc, score]) => {
          const numScore = Number(score);
          if (!isNaN(numScore)) {
            projectedScores[disc] = numScore;
            projectedTotal += numScore;
            if (numScore > 0) projectedCount += 1;
          }
        });

        Object.entries(sub.supervisorAssessment || {}).forEach(
          ([disc, score]) => {
            const numScore = Number(score);
            if (!isNaN(numScore)) {
              supervisorScores[disc] = numScore;
              supervisorTotal += numScore;
              if (numScore > 0) supervisorCount += 1;
            }
          }
        );

        acc[key] = {
          name,
          occupation,
          email,
          role,
          scores: {
            current: currentScores,
            projected: projectedScores,
            supervisor: supervisorScores,
          },
          total: {
            current: currentTotal,
            projected: projectedTotal,
            supervisor: supervisorTotal,
          },
          average: {
            current:
              currentCount > 0 ? (currentTotal / currentCount).toFixed(2) : 0,
            projected:
              projectedCount > 0
                ? (projectedTotal / projectedCount).toFixed(2)
                : 0,
            supervisor:
              supervisorCount > 0
                ? (supervisorTotal / supervisorCount).toFixed(2)
                : 0,
          },
          submittedAt: sub.submittedAt,
        };
      }
      return acc;
    }, {});
  };

  const calculateDisciplinePerformance = () => {
    const disciplines = getDisciplines();
    return disciplines.reduce((acc, disc) => {
      const currentScores = filteredSubmissions
        .map((sub) => Number(sub.current?.[disc]) || 0)
        .filter((score) => score > 0);
      const projectedScores = filteredSubmissions
        .map((sub) => Number(sub.projected?.[disc]) || 0)
        .filter((score) => score > 0);
      const supervisorScores = filteredSubmissions
        .map((sub) => Number(sub.supervisorAssessment?.[disc]) || 0)
        .filter((score) => score > 0);

      const currentAvg =
        currentScores.length > 0
          ? (
              currentScores.reduce((sum, score) => sum + score, 0) /
              currentScores.length
            ).toFixed(2)
          : 0;
      const projectedAvg =
        projectedScores.length > 0
          ? (
              projectedScores.reduce((sum, score) => sum + score, 0) /
              projectedScores.length
            ).toFixed(2)
          : 0;
      const supervisorAvg =
        supervisorScores.length > 0
          ? (
              supervisorScores.reduce((sum, score) => sum + score, 0) /
              supervisorScores.length
            ).toFixed(2)
          : 0;

      const currentSum =
        currentScores.length > 0
          ? currentScores.reduce((sum, score) => sum + score, 0).toFixed(2)
          : 0;
      const projectedSum =
        projectedScores.length > 0
          ? projectedScores.reduce((sum, score) => sum + score, 0).toFixed(2)
          : 0;
      const supervisorSum =
        supervisorScores.length > 0
          ? supervisorScores.reduce((sum, score) => sum + score, 0).toFixed(2)
          : 0;

      const count = currentScores.length;
      const min = count > 0 ? Math.min(...currentScores).toFixed(2) : 0;
      const max = count > 0 ? Math.max(...currentScores).toFixed(2) : 0;

      let stdDev = 0;
      if (count > 0) {
        const avg = parseFloat(currentAvg);
        const squareDiffs = currentScores.map((score) =>
          Math.pow(score - avg, 2)
        );
        stdDev = Math.sqrt(
          squareDiffs.reduce((sum, val) => sum + val, 0) / count
        ).toFixed(2);
      }

      acc[disc] = {
        count,
        min,
        max,
        stdDev,
        sum: {
          current: currentSum,
          projected: projectedSum,
          supervisor: supervisorSum,
        },
        average: {
          current: currentAvg,
          projected: projectedAvg,
          supervisor: supervisorAvg,
        },
      };
      return acc;
    }, {});
  };

  const getTopPerformers = () => {
    const employees = Object.values(calculateEmployeePerformance());
    return employees
      .sort(
        (a, b) =>
          parseFloat(b.average[scoreType]) - parseFloat(a.average[scoreType])
      )
      .slice(0, 3);
  };

  const getBottomPerformers = () => {
    const employees = Object.values(calculateEmployeePerformance());
    return employees
      .filter((emp) => emp.average[scoreType] > 0)
      .sort(
        (a, b) =>
          parseFloat(a.average[scoreType]) - parseFloat(b.average[scoreType])
      )
      .slice(0, 3);
  };

  const getBestDisciplines = () => {
    const disciplines = calculateDisciplinePerformance();
    return Object.entries(disciplines)
      .sort(
        ([, a], [, b]) =>
          parseFloat(b.average[scoreType]) - parseFloat(a.average[scoreType])
      )
      .slice(0, 3);
  };

  const getWorstDisciplines = () => {
    const disciplines = calculateDisciplinePerformance();
    return Object.entries(disciplines)
      .filter(([, data]) => data.average[scoreType] > 0)
      .sort(
        ([, a], [, b]) =>
          parseFloat(a.average[scoreType]) - parseFloat(b.average[scoreType])
      )
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

      const firstAvg = calculateAverage(first[scoreType]);
      const lastAvg = calculateAverage(last[scoreType]);

      trends[name] = {
        change: (lastAvg - firstAvg).toFixed(2),
        percentageChange:
          firstAvg > 0
            ? (((lastAvg - firstAvg) / firstAvg) * 100).toFixed(2)
            : "N/A",
      };
    });

    return trends;
  };

  const calculateAverage = (scores) => {
    if (!scores) return 0;
    const values = Object.values(scores)
      .map(Number)
      .filter((score) => !isNaN(score));
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  };

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

          const isSuperUser = user.name === "Paul Wanjau";


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
            {isSuperUser && (
                        <Link to="/superUser"  className="dropdown-item">
                         
                            Super User Panel
                        </Link>
                      )}
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
          {Object.keys(departments).map((dept) => (
            <option key={dept} value={dept}>
              {departments[dept] === "General Performance"
                ? "General Performance"
                : `${dept} Department`}
            </option>
          ))}
        </select>
        <span className="department-summary">
          Showing {filteredSubmissions.length} submissions from{" "}
          {selectedDepartment === "All"
            ? "all departments"
            : `the ${selectedDepartment} department`}
        </span>
      </div>

      <div className="analysis-switcher">
        <button
          className={`switch-btn ${
            analysisMode === "discipline" ? "active" : ""
          }`}
          onClick={() => setAnalysisMode("discipline")}
        >
          Discipline Analysis
        </button>
        <button
          className={`switch-btn ${
            analysisMode === "employee" ? "active" : ""
          }`}
          onClick={() => setAnalysisMode("employee")}
        >
          Employee Analysis
        </button>
      </div>

      <div className="performance-highlights">
        <div className="highlight-card">
          <h3>
            Top Performers{" "}
            {selectedDepartment !== "All" && `in ${selectedDepartment}`}
          </h3>
          <ul>
            {topPerformers.length > 0 ? (
              topPerformers.map((emp, index) => (
                <li key={emp.name}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className={`score score-${scoreType}`}>
                    {emp.average[scoreType]}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>

        <div className="highlight-card">
          <h3>
            Best Performing Disciplines{" "}
            {selectedDepartment !== "All" && `in ${selectedDepartment}`}
          </h3>
          <ul>
            {bestDisciplines.length > 0 ? (
              bestDisciplines.map(([disc, data], index) => (
                <li key={disc}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{disc}</span>
                  <span className={`score score-${scoreType}`}>
                    {data.average[scoreType]}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>

        <div className="highlight-card">
          <h3>
            Needs Improvement{" "}
            {selectedDepartment !== "All" && `in ${selectedDepartment}`}
          </h3>
          <ul>
            {bottomPerformers.length > 0 ? (
              bottomPerformers.map((emp, index) => (
                <li key={emp.name}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className={`score score-${scoreType}`}>
                    {emp.average[scoreType]}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>

        <div className="highlight-card">
          <h3>
            Challenging Disciplines{" "}
            {selectedDepartment !== "All" && `in ${selectedDepartment}`}
          </h3>
          <ul>
            {worstDisciplines.length > 0 ? (
              worstDisciplines.map(([disc, data], index) => (
                <li key={disc}>
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{disc}</span>
                  <span className={`score score-${scoreType}`}>
                    {data.average[scoreType]}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-data">No data available</li>
            )}
          </ul>
        </div>
      </div>

      <div className="analysis-section">
        <h3>
          {analysisMode === "discipline" ? "Discipline" : "Employee"}{" "}
          Performance Breakdown{" "}
          {selectedDepartment !== "All" && `for ${selectedDepartment}`}
        </h3>
        <div className="controls-container">
          <div className="score-type-switcher">
            <button
              className={`switch-btn ${
                scoreType === "current" ? "active" : ""
              }`}
              onClick={() => setScoreType("current")}
            >
              Current
            </button>
            <button
              className={`switch-btn ${
                scoreType === "projected" ? "active" : ""
              }`}
              onClick={() => setScoreType("projected")}
            >
              Projected
            </button>
            <button
              className={`switch-btn ${
                scoreType === "supervisor" ? "active" : ""
              }`}
              onClick={() => setScoreType("supervisor")}
            >
              Supervisor
            </button>
            <button
              className={`switch-btn ${scoreType === "all" ? "active" : ""}`}
              onClick={() => setScoreType("all")}
            >
              All
            </button>
          </div>
          <div className="charts-selector" ref={chartsDropdownRef}>
            <button className="charts-btn" onClick={toggleChartsDropdown}>
              {showChart ? "Hide Charts" : "Show Charts"} ▼
            </button>
            <div
              className={`charts-dropdown ${
                isChartsDropdownOpen ? "open" : ""
              }`}
            >
              {chartTypes.map((chart) => (
                <div
                  key={chart.value}
                  className="chart-item"
                  onClick={() => selectChartType(chart.value)}
                >
                  {chart.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showChart && chartType && (
          <div className="chart-container">
            <PerformanceCharts
              chartType={chartType}
              analysisMode={analysisMode}
              scoreType={scoreType}
              employeeData={employeeData}
              disciplineData={disciplineData}
              disciplines={disciplines}
              selectedDepartment={selectedDepartment}
              submissions={filteredSubmissions}
            />
          </div>
        )}
        {analysisMode === "discipline" ? (
          <table className="performance-table">
            <thead>
              <tr>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Discipline</th>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Assessments</th>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Min</th>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Max</th>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Std Dev</th>
                <th colSpan={scoreType === "all" ? 3 : 1}>
                  Total
                  {scoreType === "all" && (
                    <div className="sub-header">
                      <span className="score-current">C</span>
                      <span className="score-projected">P</span>
                      <span className="score-supervisor">S</span>
                    </div>
                  )}
                </th>
                <th colSpan={scoreType === "all" ? 3 : 1}>
                  Average
                  {scoreType === "all" && (
                    <div className="sub-header">
                      <span className="score-current">C</span>
                      <span className="score-projected">P</span>
                      <span className="score-supervisor">S</span>
                    </div>
                  )}
                </th>
              </tr>
              {scoreType === "all" && (
                <tr>
                  <th className="sub-column score-current">Current</th>
                  <th className="sub-column score-projected">Projected</th>
                  <th className="sub-column score-supervisor">Supervisor</th>
                  <th className="sub-column score-current">Current</th>
                  <th className="sub-column score-projected">Projected</th>
                  <th className="sub-column score-supervisor">Supervisor</th>
                </tr>
              )}
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
                    {scoreType === "all" ? (
                      <>
                        <td className="sub-column score-current">
                          {data.sum.current}
                        </td>
                        <td className="sub-column score-projected">
                          {data.sum.projected}
                        </td>
                        <td className="sub-column score-supervisor">
                          {data.sum.supervisor}
                        </td>
                        <td className="sub-column score-current">
                          {data.average.current}
                        </td>
                        <td className="sub-column score-projected">
                          {data.average.projected}
                        </td>
                        <td className="sub-column score-supervisor">
                          {data.average.supervisor}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`score-${scoreType}`}>
                          {data.sum[scoreType]}
                        </td>
                        <td className={`score-${scoreType}`}>
                          {data.average[scoreType]}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={scoreType === "all" ? 11 : 7}
                    className="no-data"
                  >
                    No discipline data available for this department
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="performance-table">
            <thead>
              <tr>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Name</th>
                <th rowSpan={scoreType === "all" ? 2 : 1}>Position</th>
                {disciplines.map((disc) => (
                  <th key={disc} colSpan={scoreType === "all" ? 3 : 1}>
                    {disc}
                    {scoreType === "all" && (
                      <div className="sub-header">
                        <span className="score-current">C</span>
                        <span className="score-projected">P</span>
                        <span className="score-supervisor">S</span>
                      </div>
                    )}
                  </th>
                ))}
                <th colSpan={scoreType === "all" ? 3 : 1}>
                  Total
                  {scoreType === "all" && (
                    <div className="sub-header">
                      <span className="score-current">C</span>
                      <span className="score-projected">P</span>
                      <span className="score-supervisor">S</span>
                    </div>
                  )}
                </th>
                <th colSpan={scoreType === "all" ? 3 : 1}>
                  Average
                  {scoreType === "all" && (
                    <div className="sub-header">
                      <span className="score-current">C</span>
                      <span className="score-projected">P</span>
                      <span className="score-supervisor">S</span>
                    </div>
                  )}
                </th>
              </tr>
              {scoreType === "all" && (
                <tr>
                  {disciplines.map((disc) => (
                    <React.Fragment key={disc}>
                      <th className="sub-column score-current">Current</th>
                      <th className="sub-column score-projected">Projected</th>
                      <th className="sub-column score-supervisor">
                        Supervisor
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="sub-column score-current">Current</th>
                  <th className="sub-column score-projected">Projected</th>
                  <th className="sub-column score-supervisor">Supervisor</th>
                  <th className="sub-column score-current">Current</th>
                  <th className="sub-column score-projected">Projected</th>
                  <th className="sub-column score-supervisor">Supervisor</th>
                </tr>
              )}
            </thead>
            <tbody>
              {Object.values(employeeData).length > 0 ? (
                Object.values(employeeData).map((emp) => (
                  <tr key={emp.name}>
                    <td>{emp.name}</td>
                    <td>{emp.occupation}</td>
                    {disciplines.map((disc) => (
                      <React.Fragment key={disc}>
                        {scoreType === "all" ? (
                          <>
                            <td className="sub-column score-current">
                              {emp.scores.current[disc] || "-"}
                            </td>
                            <td className="sub-column score-projected">
                              {emp.scores.projected[disc] || "-"}
                            </td>
                            <td className="sub-column score-supervisor">
                              {emp.scores.supervisor[disc] || "-"}
                            </td>
                          </>
                        ) : (
                          <td className={`score-${scoreType}`}>
                            {emp.scores[scoreType][disc] || "-"}
                          </td>
                        )}
                      </React.Fragment>
                    ))}
                    {scoreType === "all" ? (
                      <>
                        <td className="sub-column score-current">
                          {emp.total.current}
                        </td>
                        <td className="sub-column score-projected">
                          {emp.total.projected}
                        </td>
                        <td className="sub-column score-supervisor">
                          {emp.total.supervisor}
                        </td>
                        <td className="sub-column score-current">
                          {emp.average.current}
                        </td>
                        <td className="sub-column score-projected">
                          {emp.average.projected}
                        </td>
                        <td className="sub-column score-supervisor">
                          {emp.average.supervisor}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`score-${scoreType}`}>
                          {emp.total[scoreType]}
                        </td>
                        <td className={`score-${scoreType}`}>
                          {emp.average[scoreType]}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      scoreType === "all"
                        ? 2 + disciplines.length * 3 + 6
                        : 5 + disciplines.length
                    }
                    className="no-data"
                  >
                    No employee data available for this department
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
