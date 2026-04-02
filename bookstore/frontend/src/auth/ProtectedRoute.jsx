import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import Loader from "../components/common/Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <Loader text="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
