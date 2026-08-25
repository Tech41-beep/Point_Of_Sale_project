import { Navigate, Outlet, useLocation } from "react-router-dom";

function Protect({ allowedRoles = [] }) {
  const location = useLocation();
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const storedUser =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
  }

  if (!token || !user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default Protect;
