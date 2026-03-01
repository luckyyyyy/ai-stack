import { Navigate, Outlet } from "react-router-dom";

type GuestRouteProps = {
  isAuthed: boolean;
  redirectTo?: string;
};

/** Redirects authenticated users away from guest-only pages (e.g. /login, /register). */
export default function GuestRoute({
  isAuthed,
  redirectTo = "/dashboard",
}: GuestRouteProps) {
  if (isAuthed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
