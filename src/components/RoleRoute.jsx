import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({
  children,
  allowedRoles = [],
  buyerRedirect = "/home",
  sellerRedirect = "/seller-dashboard",
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "seller" ? sellerRedirect : buyerRedirect} replace />;
  }

  return children;
}

export default RoleRoute;
