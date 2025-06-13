// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "../src/components/Signup/Signup";
import Login from "../src/components/Login/Login";
import EmployeeDashboard from "../src/components/EmployeeDashboard/EmployeeDashboard";
import SupervisorDashboard from "../src/components/SupervisorDashboard/SupervisorDashboard";
import EmployeeAssessments from "../src/components/EmployeeAss/EmployeeAssessments";
import SupDash from "../src/components/SupDash/SupDash";
import StartUp from "../src/components/StartUp/StartUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartUp />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/employeeAssessments" element={<EmployeeAssessments />} />
        <Route path="/supDash" element={<SupDash />} />
      </Routes>
    </Router>
  );
}

export default App;
