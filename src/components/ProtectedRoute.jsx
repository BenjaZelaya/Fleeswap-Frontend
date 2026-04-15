import { Navigate } from "react-router-dom";
import useAuthStore from "../features/auth/store/authStore";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;