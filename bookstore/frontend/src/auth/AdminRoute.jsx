import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import Loader from "../components/common/Loader";

export default function AdminRoute({ children }) {
  const { isAuthenticated, hasRole, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <Loader text="Opening admin workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRole("ROLE_ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return children;
}
