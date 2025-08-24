import React from "react";

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

  const maxBarHeight = 100; // Max height for SVG bars
  const maxValue =
    Math.max(
      summary.totalUsers,
      summary.employees,
      summary.supervisors,
      summary.pending,
      summary.approved,
      summary.rejected
    ) || 1; // Prevent division by zero

  return (
    <div className="main-content">
      {activeSection === "overview" && (
        <div className="overview-section">
          <h3>System Overview</h3>
          <p>
            Welcome to the Super User Dashboard. Manage all users and
            submissions.
          </p>
          <div className="summary-tiles">
            <div className="tile">
              <h4>Total Users</h4>
              <div className="tile-value">{summary.totalUsers}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.totalUsers / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.totalUsers / maxValue) * maxBarHeight}
                  fill="#007bff"
                />
              </svg>
            </div>
            <div className="tile">
              <h4>Employees</h4>
              <div className="tile-value">{summary.employees}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.employees / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.employees / maxValue) * maxBarHeight}
                  fill="#17a2b8"
                />
              </svg>
            </div>
            <div className="tile">
              <h4>Supervisors</h4>
              <div className="tile-value">{summary.supervisors}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.supervisors / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.supervisors / maxValue) * maxBarHeight}
                  fill="#6f42c1"
                />
              </svg>
            </div>
            <div className="tile">
              <h4>Pending</h4>
              <div className="tile-value">{summary.pending}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.pending / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.pending / maxValue) * maxBarHeight}
                  fill="#ffc107"
                />
              </svg>
            </div>
            <div className="tile">
              <h4>Approved</h4>
              <div className="tile-value">{summary.approved}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.approved / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.approved / maxValue) * maxBarHeight}
                  fill="#28a745"
                />
              </svg>
            </div>
            <div className="tile">
              <h4>Rejected</h4>
              <div className="tile-value">{summary.rejected}</div>
              <svg width="50" height="120">
                <rect
                  x="10"
                  y={120 - (summary.rejected / maxValue) * maxBarHeight}
                  width="30"
                  height={(summary.rejected / maxValue) * maxBarHeight}
                  fill="#dc3545"
                />
              </svg>
            </div>
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
      )}
    </div>
  );
}
