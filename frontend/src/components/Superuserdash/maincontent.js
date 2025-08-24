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

  return (
    <div className="main-content">
      {activeSection === "overview" && (
        <div className="overview-section">
          <h3>System Overview</h3>
          <p>
            Welcome to the Super User Dashboard. Manage all users and
            submissions.
          </p>
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
