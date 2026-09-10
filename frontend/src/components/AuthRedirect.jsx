import { Navigate } from "react-router-dom";

function AuthRedirect({ children }) {
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

  if (token && user) {
    return <Navigate to={user.role === "user" ? "/shop" : "/"} replace />;
  }

  return children;
}

export default AuthRedirect;
