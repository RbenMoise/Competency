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
    <header className="mmodern-header">
      <div className="mmodern-logo">
        <div className="llogo-placeholder">
          <img className="llogo-icon" src={LOGO} alt="logo" />
          <span className="llogo-text">Upstream</span>
        </div>
      </div>
      <Link className="ddashlink" to="/supDash">
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
        Dashboard
      </Link>
      <div className="mmodern-profile" ref={dropdownRef}>
        <div className="pprofile-container" onClick={toggleDropdown}>
          <div className="pprofile-avatar">{initials}</div>
          <div className="pprofile-info">
            <h3>{user.name}</h3>
            <p>{user.occupation}</p>
          </div>
          <div className={`ddropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
            ▼
          </div>
        </div>
        <div className={`ddropdown-menu ${isDropdownOpen ? "open" : ""}`}>
          <div className="ddropdown-divider"></div>
          <Link to="/logout" className="ddropdown-item logout">
            Log Out
          </Link>
        </div>
      </div>
    </header>
  );
}
