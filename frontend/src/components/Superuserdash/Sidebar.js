import React from "react";
import { Link } from "react-router-dom";
import "./MainContent.css";
// import "./sidebar.css";

export default function Sidebar({ setActiveSection }) {
  return (
    <div className="ssidebar">
      <h3>Super User Menu</h3>
      <button
        className="ssidebar-button"
        onClick={() => setActiveSection("overview")}
      >
        Overview
      </button>
      <div className="ssidebar-section">
        <button
          className="ssidebar-button"
          onClick={() => setActiveSection("users")}
        >
          All Users
        </button>
        <div className="ssidebar-subsection">
          <button
            className="ssidebar-subbutton"
            onClick={() => setActiveSection("supervisors")}
          >
            Supervisors
          </button>
          <button
            className="ssidebar-subbutton"
            onClick={() => setActiveSection("employees")}
          >
            Employees
          </button>
        </div>
      </div>
      <button
        className="ssidebar-button"
        onClick={() => setActiveSection("submissions")}
      >
        All Submissions
      </button>
      <Link to="/employeeAssessments">
        <button className="ssidebar-button">Manage Employee Assessments</button>
      </Link>
      <Link to="/teamPerformance">
        <button className="ssidebar-button">View Team Performance</button>
      </Link>
    </div>
  );
}
