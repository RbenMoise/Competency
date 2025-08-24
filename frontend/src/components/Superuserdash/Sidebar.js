import React from "react";
import { Link } from "react-router-dom";
import "./MainContent.css";
// import "./sidebar.css";

export default function Sidebar({ setActiveSection }) {
  return (
    <div className="sidebar">
      <h3>Super User Menu</h3>
      <button
        className="sidebar-button"
        onClick={() => setActiveSection("overview")}
      >
        Overview
      </button>
      <div className="sidebar-section">
        <button
          className="sidebar-button"
          onClick={() => setActiveSection("users")}
        >
          All Users
        </button>
        <div className="sidebar-subsection">
          <button
            className="sidebar-subbutton"
            onClick={() => setActiveSection("supervisors")}
          >
            Supervisors
          </button>
          <button
            className="sidebar-subbutton"
            onClick={() => setActiveSection("employees")}
          >
            Employees
          </button>
        </div>
      </div>
      <button
        className="sidebar-button"
        onClick={() => setActiveSection("submissions")}
      >
        All Submissions
      </button>
      <Link to="/employeeAssessments">
        <button className="sidebar-button">Manage Employee Assessments</button>
      </Link>
      <Link to="/teamPerformance">
        <button className="sidebar-button">View Team Performance</button>
      </Link>
    </div>
  );
}
