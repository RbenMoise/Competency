import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import LOGO from "../../assets/nock j.png";

export default function Header({ user, summary }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nameParts = user.name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0];

  return (
    <header className="modern-header">
      <div className="modern-logo">
        <div className="logo-placeholder">
          <img className="logo-icon" src={LOGO} alt="logo" />
          <span className="logo-text">Energizing Kenya</span>
        </div>
      </div>
      <div className="header-content">
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
            Pending: <strong>{summary.pending}</strong>
          </p>
          <p>
            Approved: <strong>{summary.approved}</strong>
          </p>
          <p>
            Rejected: <strong>{summary.rejected}</strong>
          </p>
        </div>
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
      </div>
    </header>
  );
}
