import React from "react";
import { Link } from "react-router-dom";

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
      <button
        className="sidebar-button"
        onClick={() => setActiveSection("users")}
      >
        All Users
      </button>
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
