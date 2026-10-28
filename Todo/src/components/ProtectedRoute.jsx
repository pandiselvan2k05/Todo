import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Check login
  if (!token || !role) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (role === "user") {
      return <Navigate to="/user" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // Allow access to nested routes
  return <Outlet />;
}

export default ProtectedRoute;