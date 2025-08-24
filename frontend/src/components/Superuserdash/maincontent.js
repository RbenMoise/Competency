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
} from "recharts";
import "./MainContent.css";

export default function MainContent({
  activeSection,
  allUsers,
  submissions,
  summary,
}) {
  const formatScores = (scores) => {
    if (!scores || typeof scores !== "object") return "No assessment";
    return Object.entries(scores)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  const fullChartData = [
    { name: "Total Users", value: summary.totalUsers, fill: "#007bff" },
    { name: "Employees", value: summary.employees, fill: "#17a2b8" },
    { name: "Supervisors", value: summary.supervisors, fill: "#6f42c1" },
    { name: "Pending", value: summary.pending, fill: "#ffc107" },
    { name: "Approved", value: summary.approved, fill: "#28a745" },
    { name: "Rejected", value: summary.rejected, fill: "#dc3545" },
  ];

  const [chartData, setChartData] = useState([]);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (activeSection === "overview") {
      setChartData([]); // Reset chart data
      setAnimationStep(0); // Reset animation

      const interval = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev < fullChartData.length) {
            setChartData(fullChartData.slice(0, prev + 1));
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 500); // Add one data point every 500ms

      return () => clearInterval(interval);
    }
  }, [activeSection, summary]);

  return (
    <div className="main-content">
      {activeSection === "overview" && (
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
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#8884d8" }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <ReferenceLine
                  y={Math.max(...fullChartData.map((d) => d.value)) * 0.8}
                  stroke="#dc3545"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {activeSection === "users" && (
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
      )}
      {activeSection === "submissions" && (
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
                      ? new Date(sub.appliedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{formatScores(sub.current)}</td>
                  <td>{formatScores(sub.supervisorAssessment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
