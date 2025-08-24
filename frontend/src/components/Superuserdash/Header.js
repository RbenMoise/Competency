import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import LOGO from "../../assets/nock j.png";

export default function Header({ user }) {
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
      <Link className="dashlink" to="/supDash">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="3" width="8" height="8" rx="1" fill="#0c0c0c" />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="1"
            fill="#0c0c0c"
            opacity="0.8"
          />
          <rect x="13" y="3" width="8" height="8" rx="1" fill="#0c0c0c" />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="1"
            fill="#0c0c0c"
            opacity="0.8"
          />
          <path d="M12 3V21" stroke="#e0e0e0" strokeWidth="1.5" />
          <path d="M3 12H21" stroke="#e0e0e0" strokeWidth="1.5" />
        </svg>
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
  );
}
