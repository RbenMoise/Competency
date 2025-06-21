import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import ProtectedRoute from "./ProtectedRoutes";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard";
import SupervisorDashboard from "./components/SupervisorDashboard/SupervisorDashboard";
import EmployeeAssessments from "./components/EmployeeAss/EmployeeAssessments";
import SupDash from "./components/SupDash/SupDash";
import StartUp from "./components/StartUp/StartUp";
import TeamPerformance from "./components/TeamPerformance/TeamPerformance";
import { Navigate } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartUp />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/employee"
            element={
              <ProtectedRoute
                element={<EmployeeDashboard />}
                allowedRoles={["employee"]}
              />
            }
          />
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute
                element={<SupervisorDashboard />}
                allowedRoles={["supervisor"]}
              />
            }
          />
          <Route
            path="/employeeAssessments"
            element={
              <ProtectedRoute
                element={<EmployeeAssessments />}
                allowedRoles={["supervisor"]}
              />
            }
          />
          <Route
            path="/supDash"
            element={
              <ProtectedRoute
                element={<SupDash />}
                allowedRoles={["supervisor"]}
              />
            }
          />
          <Route
            path="/teamPerformance"
            element={
              <ProtectedRoute
                element={<TeamPerformance />}
                allowedRoles={["supervisor"]}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
