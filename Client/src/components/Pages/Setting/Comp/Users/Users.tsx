import React, { useState, useEffect } from "react";
import axios from "axios";
import SLogo from "../../../../assest/SuppoortLogo/SLogo";
import Navbar from "../../../../Nav/nav";
import config from "../../../../../config";
import "./style.css";

interface User {
  _id: string;
  isActive: boolean;
  email: string;
  role: string;
  username: string;
}

interface NewUser {
  email: string;
  role: string;
  username: string;
  password: string;
}

const Users: React.FC = () => {
  const url = config.url;
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    username: "",
    password: "",
    role: "",
  });

  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false); // ✅ מצב של המודאל

  // ✅ מצב Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // מספר משתמשים בעמוד
  useEffect(() => {
    document.body.classList.add('dash-board-background');

    return () => {
      document.body.classList.remove('dash-board-background');
    };
  }, []);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}users/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${url}users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${url}users/register`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setNewUser({ email: "", username: "", password: "", role: "" });
      fetchUsers();
      setShowModal(false); // ✅ סוגר את המודאל אחרי יצירת משתמש
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // ✅ חישוב משתמשים לעמוד הנוכחי
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // ✅ חישוב מספר עמודים
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <>
      <Navbar />
      <SLogo />

      <div className="users-container">
        <h2 className="users-title">רשימת משתמשים</h2>

        {/* טבלה של משתמשים */}
        <table className="users-table">
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>אימייל</th>
              <th>תפקיד</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id} className="users-row">
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className="users-role">{user.role || "משתמש"}</td>
                <td className={`users-status ${user.isActive ? "online" : "offline"}`}>
                  {user.isActive ? "🟢 מחובר" : "🔴 לא מחובר"}
                </td>
                <td>
                  <button
                    className="users-delete-button"
                    onClick={() => handleDelete(user._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        <div className="pagination">
        <button
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &lt;
          </button>
          <button
            className="pagination-button"
         
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &gt;
          </button>
          <span className="pagination-info">
            עמוד {currentPage} מתוך {totalPages}
          </span>
        </div>

        {/* כפתור לפתיחת המודאל */}
        <h2 className="users-title">
          <div className="users-toggle-button" onClick={() => setShowModal(true)}>
            ➕
          </div>
        </h2>

        {/* מודאל יצירת משתמש */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="modal-close" onClick={() => setShowModal(false)}>
                ❌
              </span>
              <h2 className="users-form-title">יצירת משתמש חדש</h2>
              <div className="users-input-group">
                <input
                    type="text"
                    placeholder="מייל"
                    value={newUser.email}
                    onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="users-input"
                />
                <input
                    type="text"
                    placeholder="שם משתמש"
                    value={newUser.username}
                    onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                    }
                    className="users-input"
                />
                <input
                    type="password"
                    placeholder="סיסמא"
                    value={newUser.password}
                    onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="users-input"
                />

                {/* 🔽 הוספת SELECT לבחירת תפקיד */}
                <select
                    className="users-input-select"
                    value={newUser.role}
                    onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                    }
                >
                    <option value="">בחר תפקיד</option>
                    <option value="user">משתמש</option>
                    <option value="admin">מנהל</option>
                </select>
                </div>

              <button className="users-create-button" onClick={handleCreate}>
                צור משתמש
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Users;
