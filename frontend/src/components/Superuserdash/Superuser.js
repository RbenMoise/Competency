import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./maincontent";
import LoadingSpinner from "../SupDash/Loading Spinner";
import "./Superuser.css";

export default function SuperUserDash() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    employees: 0,
    supervisors: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/auth/me`,
          { withCredentials: true }
        );
        const userData = userRes.data.user;
        setUser(userData);

        // if (userData.role !== "super") {
        //   setError("Access restricted to super users");
        //   setIsLoading(false);
        //   return;
        // }

        const teamRes = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000"
          }/api/team`,
          { withCredentials: true }
        );
        const users = teamRes.data.users;
        setAllUsers(users);
        setSubmissions(
          users.flatMap((user) =>
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
        setSummary({
          totalUsers: users.length,
          employees: users.filter((u) => u.role === "employee").length,
          supervisors: users.filter((u) => u.role === "supervisor").length,
          pending: teamRes.data.summary.pending,
          approved: teamRes.data.summary.approved,
          rejected: teamRes.data.summary.rejected,
        });
        setIsLoading(false);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            "Failed to load super user dashboard data."
        );
        setIsLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate]);

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

  return (
    <div className="super-user-container">
      <Header user={user} />
      <div className="dashboard-layout">
        <Sidebar setActiveSection={setActiveSection} />
        <MainContent
          activeSection={activeSection}
          allUsers={allUsers}
          submissions={submissions}
          summary={summary}
        />
      </div>
    </div>
  );
}
