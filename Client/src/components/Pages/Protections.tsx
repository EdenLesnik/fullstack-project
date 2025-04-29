import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // מפענח את ה-JWT
    const decodedToken: { id: string; username: string; exp: number } = jwtDecode(token);

    // בדיקה אם הטוקן פג תוקף
    const currentTime = Date.now() / 1000; // שניות
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token"); // מסיר את הטוקן הלא תקף
      return <Navigate to="/login" replace />;
    }

    return <Outlet />; // אם הכול תקין, ממשיך הלאה
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // במקרה של שגיאה מוחק את הטוקן
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
