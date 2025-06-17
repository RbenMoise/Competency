import React from "react";
import "./LoadingSpinner.css";
import LOGO from "../../assets/nock j.png";

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner-wrapper">
        <div className="spinner-ring"></div>
        <div className="spinner-ring spinner-delay-1"></div>
        <div className="spinner-ring spinner-delay-2"></div>
        <img src={LOGO} alt="NOCK Logo" className="spinner-logo" />
      </div>
      <div className="spinner-text">
        <h2>Loading Your Dashboard</h2>
        <p>Fetching data, please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
