import React, { useState, useRef, useEffect } from "react";
import LOGO from "../../assets/nock j.png";
import SupGuidelines from "../Guidelines/SupGuidelines";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmployeeAssessments.css";
import LoadingSpinner from "../SupDash/Loading Spinner";

export default function EmployeeAssessments() {
  function DashboardIcon() {
    return (
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
    );
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [filter, setFilter] = useState("All");
  const [rejectComments, setRejectComments] = useState({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [supervisorAssessment, setSupervisorAssessment] = useState({});
  const [modalMode, setModalMode] = useState("edit");
  const [isLoading, setIsLoading] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // You can adjust this number
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fetchSubmissions = async () => {
    try {
      const teamRes = await axios.get(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/api/team`,
        {
          withCredentials: true,
        }
      );
      console.log("Fetched team data:", teamRes.data);
      setSubmissions(
        teamRes.data.users.flatMap((user) =>
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
      setSummary(teamRes.data.summary);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load team data.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL
              ? process.env.REACT_APP_API_URL
              : "http://localhost:4000"
          }/api/auth/me`,
          {
            withCredentials: true,
          }
        );
        const userData = userRes.data.user;
        console.log("Fetched user data:", userData);
        setUser(userData);

        if (userData.role !== "supervisor") {
          setError("Access restricted to supervisors");
          setIsLoading(false);
          return;
        }

        await fetchSubmissions();
        setIsLoading(false);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load data.");
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

  const openApprovalModal = (submission, mode = "edit") => {
    setCurrentSubmission(submission);
    setModalMode(mode);
    if (mode === "edit") {
      setSupervisorAssessment(
        Object.keys(submission.current).reduce(
          (acc, curr) => ({
            ...acc,
            [curr]: "",
          }),
          {}
        )
      );
    }
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    try {
      const res = await axios.patch(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/api/scores/${currentSubmission._id}/approve`,
        { status: "approved", supervisorAssessment },
        { withCredentials: true }
      );
      console.log(`Submission ${currentSubmission._id} approved:`, res.data);
      await fetchSubmissions();
      setShowApprovalModal(false);
      setCurrentSubmission(null);
      setSupervisorAssessment({});
      setCurrentPage(1); // Reset to first page after approval
    } catch (err) {
      console.error("Error approving submission:", err);
      setError("Failed to approve submission.");
    }
  };

  const handleReject = async (submissionId, comments) => {
    try {
      const res = await axios.patch(
        `${
          process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL
            : "http://localhost:4000"
        }/api/scores/${submissionId}/approve`,
        { status: "rejected", approvalComments: comments },
        { withCredentials: true }
      );
      console.log(`Submission ${submissionId} rejected:`, res.data);
      await fetchSubmissions();
      setRejectComments((prev) => ({ ...prev, [submissionId]: "" }));
      setCurrentPage(1); // Reset to first page after rejection
    } catch (err) {
      console.error("Error rejecting submission:", err);
      setError("Failed to reject submission.");
    }
  };

  const filteredSubmissions =
    filter === "All"
      ? submissions
      : submissions.filter((sub) =>
          filter === "Pending"
            ? sub.status === "pending"
            : filter === "Completed"
            ? sub.status === "approved"
            : filter === "Rejected"
            ? sub.status === "rejected"
            : false
        );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="assessments-container">
      <header className="modern-header">
        <div className="modern-logo">
          <div className="logo-placeholder">
            <img className="logo-icon" src={LOGO} alt="logo" />
            <span className="logo-text">Upstream</span>
          </div>
        </div>
        <Link className="dashlink" to="/supDash">
          <DashboardIcon />
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
      <h2>Employee Assessments</h2>
      <div className="assessments-header">
        <div className="status-message">
          <p>Total Staff: {summary.totalUsers}</p>
          <p>
            Pending: {summary.pending} | Approved: {summary.approved} |
            Rejected: {summary.rejected}
          </p>
        </div>
      </div>
      <div className="assessments-content">
        <div className="action-card">
          <Link to="/teamPerformance">
            <button className="view-all-btn">
              View Team Performance
              <span className="arrow-icon">→</span>
            </button>
          </Link>
        </div>
        <div className="filter-tabs">
          <div
            className={`tab ${filter === "All" ? "active" : ""}`}
            onClick={() => {
              setFilter("All");
              setCurrentPage(1); // Reset to first page when filter changes
            }}
          >
            All ({submissions.length})
          </div>
          <div
            className={`tab ${filter === "Pending" ? "active" : ""}`}
            onClick={() => {
              setFilter("Pending");
              setCurrentPage(1);
            }}
          >
            Pending ({summary.pending})
          </div>
          <div
            className={`tab ${filter === "Completed" ? "active" : ""}`}
            onClick={() => {
              setFilter("Completed");
              setCurrentPage(1);
            }}
          >
            Completed ({summary.approved})
          </div>
          <div
            className={`tab ${filter === "Rejected" ? "active" : ""}`}
            onClick={() => {
              setFilter("Rejected");
              setCurrentPage(1);
            }}
          >
            Rejected ({summary.rejected})
          </div>
        </div>
        {filteredSubmissions.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-content">
              <div className="empty-icon">🔍</div>
              <h3>No Assessments</h3>
              <p>Try refreshing or check back later</p>
            </div>
          </div>
        ) : (
          <>
            <div className="submissions-table">
              <table className="sub-table-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Employee Assessment</th>
                    <th>Supervisor Assessment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.submitter.name}</td>
                      <td>{submission.submitter.occupation}</td>
                      <td>
                        <span
                          className={`status-badge ${submission.status.toLowerCase()}`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                      <td>{formatScores(submission.current)}</td>
                      <td>{formatScores(submission.supervisorAssessment)}</td>
                      <td>
                        {submission.status === "pending" ? (
                          <div className="action-buttons">
                            <button
                              className="approve-btn"
                              onClick={() =>
                                openApprovalModal(submission, "edit")
                              }
                            >
                              Assess
                            </button>
                            <div className="reject-container">
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectComments[submission._id] || ""}
                                onChange={(e) =>
                                  setRejectComments((prev) => ({
                                    ...prev,
                                    [submission._id]: e.target.value,
                                  }))
                                }
                                className="reject-input"
                              />
                              <button
                                className="reject-btn"
                                onClick={() =>
                                  handleReject(
                                    submission._id,
                                    rejectComments[submission._id] || ""
                                  )
                                }
                                disabled={!rejectComments[submission._id]}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="view-btn"
                            onClick={() => openApprovalModal(submission, "view")}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
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
        )}
      </div>
      {showApprovalModal && currentSubmission && (
        <div className="modal-overlay">
          <div className="approval-modal">
            <h3>
              {modalMode === "edit"
                ? `Assess Submission for ${currentSubmission.submitter.name}`
                : `Submission for ${currentSubmission.submitter.name}`}
            </h3>
            <div className="user-info">
              <p>
                <strong>Name:</strong> {currentSubmission.submitter.name}
              </p>
              <p>
                <strong>Email:</strong> {currentSubmission.submitter.email}
              </p>
              <p>
                <strong>Position:</strong>{" "}
                {currentSubmission.submitter.occupation}
              </p>
              <p>
                <strong>Role:</strong> {currentSubmission.submitter.role}
              </p>
            </div>
            <div className="scores-comparison">
              <h4>Performance Assessment</h4>
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Current Employee State</th>
                    <th>Supervisor Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(currentSubmission.current).map(
                    ([category, value]) => (
                      <tr key={category}>
                        <td>{category}</td>
                        <td>{value}</td>
                        <td>
                          {modalMode === "edit" ? (
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={supervisorAssessment[category] || ""}
                              onChange={(e) =>
                                setSupervisorAssessment((prev) => ({
                                  ...prev,
                                  [category]: parseInt(e.target.value) || "",
                                }))
                              }
                              className="assessment-input"
                              placeholder="0-5"
                            />
                          ) : (
                            currentSubmission.supervisorAssessment?.[
                              category
                            ] || "-"
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              {modalMode === "view" &&
                currentSubmission.status === "rejected" && (
                  <div className="rejection-comments">
                    <h4>Rejection Comments</h4>
                    <p>
                      {currentSubmission.approvalComments ||
                        "No comments provided."}
                    </p>
                  </div>
                )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowPopup(true)}
                className="approve-btn"
              >
                Guidelines
              </button>
              {showPopup && (
                <SupGuidelines onClose={() => setShowPopup(false)} />
              )}
              <button
                className="cancel-btn"
                onClick={() => setShowApprovalModal(false)}
              >
                {modalMode === "edit" ? "Cancel" : "Close"}
              </button>
              {modalMode === "edit" && (
                <button
                  className="approve-btn"
                  onClick={handleApproval}
                  disabled={
                    Object.keys(supervisorAssessment).length !==
                      Object.keys(currentSubmission.current).length ||
                    Object.values(supervisorAssessment).some(
                      (val) => val === ""
                    )
                  }
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}