import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../src/components/context/AuthContext";
import LoadingSpinner from "../src/components/SupDash/Loading Spinner";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
