import React from "react";
import { Navigate } from "react-router-dom";

// Custom route protection logic
const AuthRoute = ({ element: Component }) => {
  const token = localStorage.getItem("authToken");
  return token ? <Component /> : <Navigate to="/login" />;
};

export default AuthRoute;
