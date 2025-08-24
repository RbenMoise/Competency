import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import axios from "axios";
import "./MainContent.css";

export default function MainContent({ activeSection, allUsers, summary }) {
  const [viewMode, setViewMode] = useState("list"); // "list" or "submissions"
  const [subViewMode, setSubViewMode] = useState("scores"); // "scores" or "spider"
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

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

  const formatScore = (score) => {
    return score !== undefined && score !== null ? score : "-";
  };

  const formatDate = (date) => {
    return date && !isNaN(new Date(date).getTime())
      ? new Date(date).toLocaleString()
      : "-";
  };

  const fullChartData = [
    {
      name: "Total Users",
      value: summary.totalUsers || 0,
      midValue: (summary.totalUsers || 0) * 0.5,
      fill: "#007bff",
    },
    {
      name: "Employees",
      value: summary.employees || 0,
      midValue: (summary.employees || 0) * 0.5,
      fill: "#17a2b8",
    },
    {
      name: "Supervisors",
      value: summary.supervisors || 0,
      midValue: (summary.supervisors || 0) * 0.5,
      fill: "#6f42c1",
    },
    {
      name: "Pending",
      value: summary.pending || 0,
      midValue: (summary.pending || 0) * 0.5,
      fill: "#ffc107",
    },
    {
      name: "Approved",
      value: summary.approved || 0,
      midValue: (summary.approved || 0) * 0.5,
      fill: "#28a745",
    },
    {
      name: "Rejected",
      value: summary.rejected || 0,
      midValue: (summary.rejected || 0) * 0.5,
      fill: "#dc3545",
    },
  ];

  const [chartData, setChartData] = useState([]);
  const [animationStep, setAnimationStep] = useState(0);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const teamRes = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/team`,
        { withCredentials: true }
      );
      console.log("Fetched team data:", teamRes.data);
      setSubmissions(
        teamRes.data.users.flatMap((user) =>
          user.submissions.map((sub) => ({
            ...sub,
            submitter: {
              _id: user._id,
              name: user.name,
              email: user.email,
              occupation: user.occupation,
              role: user.role,
            },
          }))
        )
      );
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "overview" ||
      activeSection === "users" ||
      activeSection === "supervisors" ||
      activeSection === "employees" ||
      activeSection === "submissions"
    ) {
      fetchSubmissions();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "overview") {
      setChartData([]);
      setAnimationStep(0);

      const interval = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev < fullChartData.length) {
            setChartData(fullChartData.slice(0, prev + 1));
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [activeSection, summary]);

  const filteredUsers =
    activeSection === "supervisors"
      ? allUsers.filter((u) => u.role === "supervisor")
      : activeSection === "employees"
      ? allUsers.filter((u) => u.role === "employee")
      : allUsers;

  const openSubmissionsView = (user) => {
    setSelectedUser(user);
    setCurrentPage(1);
    setSubViewMode("scores");
    setViewMode("submissions");
  };

  const goBackToList = () => {
    setSelectedUser(null);
    setSubViewMode("scores");
    setViewMode("list");
  };

  const userSubmissions = selectedUser
    ? submissions.filter((sub) => sub.submitter?._id === selectedUser._id)
    : [];

  const latestSubmission =
    userSubmissions.length > 0
      ? userSubmissions.reduce((latest, sub) =>
          !latest || new Date(sub.submittedAt) > new Date(latest.submittedAt)
            ? sub
            : latest
        )
      : null;

  const radarData = latestSubmission
    ? categories.map((cat) => ({
        category: cat,
        current: latestSubmission.current?.[cat] || 0,
        projected: latestSubmission.projected?.[cat] || 0,
        supervisor: latestSubmission.supervisorAssessment?.[cat] || 0,
      }))
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = userSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(userSubmissions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div className="loading-message">Loading submissions...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchSubmissions}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="main-content">
      {activeSection === "overview" && viewMode === "list" && (
        <div className="overview-section">
          <h3>System Overview</h3>
          <p>
            Welcome to the Super User Dashboard. Manage all users and
            submissions.
          </p>
          <div className="summary-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                className="modern-bar-chart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#333", fontSize: 12 }}
                  axisLine={{ stroke: "#ccc" }}
                />
                <YAxis
                  tick={{ fill: "#333", fontSize: 12 }}
                  axisLine={{ stroke: "#ccc" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="midValue"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#ffffff",
                    stroke: "url(#dotGradient)",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#ffffff",
                    stroke: "#4c51bf",
                    strokeWidth: 2,
                  }}
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                  className="animated-line"
                />
                <ReferenceLine
                  y={Math.max(...fullChartData.map((d) => d.value)) * 0.8}
                  stroke="#dc3545"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#4c51bf" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#9f7aea" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient
                    id="dotGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#4c51bf" stopOpacity={1} />
                    <stop offset="100%" stopColor="#9f7aea" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {(activeSection === "users" ||
        activeSection === "supervisors" ||
        activeSection === "employees") &&
        viewMode === "list" && (
          <div className="users-section">
            <h3>
              {activeSection === "supervisors"
                ? "Supervisors"
                : activeSection === "employees"
                ? "Employees"
                : "All Users"}
            </h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Occupation</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name || "Unknown"}</td>
                    <td>{u.email || "-"}</td>
                    <td>{u.role || "-"}</td>
                    <td>{u.occupation || "-"}</td>
                    <td>{u.submissions?.length || 0}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => openSubmissionsView(u)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {(activeSection === "users" ||
        activeSection === "supervisors" ||
        activeSection === "employees") &&
        viewMode === "submissions" &&
        selectedUser && (
          <div className="submissions-modal">
            <div className="modal-header">
              <button
                className="back-icon-btn"
                onClick={goBackToList}
                title="Back to Users"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3>Submissions for {selectedUser.name}</h3>
            </div>
            <div className="user-info">
              <p>
                <strong>Name:</strong> {selectedUser.name || "Unknown"}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email || "-"}
              </p>
              <p>
                <strong>Position:</strong> {selectedUser.occupation || "-"}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role || "-"}
              </p>
              {latestSubmission && (
                <>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${
                        latestSubmission.status?.toLowerCase() || "unknown"
                      }`}
                    >
                      {latestSubmission.status || "Unknown"}
                    </span>
                  </p>
                  <p>
                    <strong>Submitted At:</strong>{" "}
                    {formatDate(latestSubmission.submittedAt)}
                  </p>
                  <p>
                    <strong>Reviewed By:</strong>{" "}
                    {latestSubmission.approvedBy || "-"}
                  </p>
                  <p>
                    <strong>Reviewed At:</strong>{" "}
                    {formatDate(latestSubmission.approvedAt)}
                  </p>
                  <p>
                    <strong>Comments:</strong>{" "}
                    {latestSubmission.approvalComments || "-"}
                  </p>
                </>
              )}
            </div>
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${
                  subViewMode === "scores" ? "active-view-btn" : ""
                }`}
                onClick={() => setSubViewMode("scores")}
              >
                Scores
              </button>
              <button
                className={`view-toggle-btn ${
                  subViewMode === "spider" ? "active-view-btn" : ""
                }`}
                onClick={() => setSubViewMode("spider")}
              >
                Spider Chart
              </button>
            </div>
            {userSubmissions.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-content">
                  <div className="empty-icon">🔍</div>
                  <h3>No Submissions</h3>
                  <p>This user has no submissions.</p>
                </div>
              </div>
            ) : subViewMode === "scores" ? (
              <>
                {currentSubmissions.map((sub, index) => (
                  <div key={sub._id} className="submission-entry">
                    <h4>
                      Submission {index + 1 + (currentPage - 1) * itemsPerPage}{" "}
                    </h4>
                    <table className="nested-scores-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Current</th>
                          <th>Projected</th>
                          <th>Supervisor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat}>
                            <td>{cat}</td>
                            <td className="score-current">
                              {formatScore(sub.current?.[cat])}
                            </td>
                            <td className="score-projected">
                              {formatScore(sub.projected?.[cat])}
                            </td>
                            <td className="score-supervisor">
                              {formatScore(sub.supervisorAssessment?.[cat])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="pagination-controls">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="spider-chart-wrapper">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e0e0e0" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{
                          fill: "#333",
                          fontSize: 12,
                          fontFamily: "Inter, sans-serif",
                        }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 5]}
                        tick={{ fill: "#333", fontSize: 12 }}
                      />
                      <Radar
                        name="Current Scores"
                        dataKey="current"
                        stroke="#007bff"
                        fill="#007bff"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Projected Scores"
                        dataKey="projected"
                        stroke="#28a745"
                        fill="#28a745"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Supervisor Scores"
                        dataKey="supervisor"
                        stroke="#6f42c1"
                        fill="#6f42c1"
                        fillOpacity={0.3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state-card">
                    <div className="empty-state-content">
                      <div className="empty-icon">📊</div>
                      <h3>No Scores Available</h3>
                      <p>No scores available for visualization.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button className="back-btn" onClick={goBackToList}>
                Back
              </button>
            </div>
          </div>
        )}
      {activeSection === "submissions" && viewMode === "list" && (
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
                <th>Current Scores</th>
                <th>Projected Scores</th>
                <th>Supervisor Scores</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.submitter?.name || "Unknown"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        sub.status?.toLowerCase() || "unknown"
                      }`}
                    >
                      {sub.status || "Unknown"}
                    </span>
                  </td>
                  <td>{formatDate(sub.submittedAt)}</td>
                  <td>{sub.approvedBy || "-"}</td>
                  <td>{formatDate(sub.approvedAt)}</td>
                  <td>
                    {Object.entries(sub.current || {})
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </td>
                  <td>
                    {Object.entries(sub.projected || {})
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </td>
                  <td>
                    {Object.entries(sub.supervisorAssessment || {})
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
