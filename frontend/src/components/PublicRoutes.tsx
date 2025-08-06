import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contex/AuthContex";

const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  return user ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;