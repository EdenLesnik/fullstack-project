import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />; // אם אין טוקן -> מעביר להתחברות
  }

  try {
    const decoded: { role: string } = jwtDecode(token);

    if (decoded.role !== "admin") {
      return <Navigate to="/dashboard" replace />; // אם הוא לא אדמין -> מחזיר לדשבורד
    }

    return <Outlet />; // אם הוא אדמין -> מאפשר גישה לכל הרוטים הפנימיים
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" replace />; // אם יש שגיאה -> מחזיר להתחברות
  }
};

export default AdminRoute;
