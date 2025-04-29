import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCog, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode'; // נדרשת ספריית jwt-decode
import './style.css';

const Navbar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { username: string, role: string } = jwtDecode(token);
        setUsername(decoded.username);
        setRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/"></Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/dashboard">
            <FontAwesomeIcon icon={faEnvelope} /> קריאות
          </Link>
        </li>
        <li>
          <Link to="/archive">
            <FontAwesomeIcon icon={faTrash} /> ארכיון
          </Link>
        </li>
        {/* 🔹 הצגת הגדרות רק למנהלים */}
        {role && (
  <li className="dropdown">
    <button className="dropdown-toggle" onClick={() => setSettingsOpen(!settingsOpen)}>
      <FontAwesomeIcon icon={faCog} /> הגדרות
      <FontAwesomeIcon icon={settingsOpen ? faChevronUp : faChevronDown} className="arrow-icon" />
    </button>
    {settingsOpen && (
      <ul className="dropdown-menu">
        {/* 🔹 "אישי" יופיע לכולם */}
        <li>
          <Link to="/dashboard">אישי</Link>
        </li>

                {/* 🔹 רק Admin רואה את שאר האפשרויות */}
                {role === "admin" && (
                  <>
                    <li>
                      <Link to="/setting/depcat">מחלקות</Link>
                    </li>
                    <li>
                      <Link to="/setting/sla">SLA</Link>
                    </li>
                    <li>
                      <Link to="/setting/users">משתמשים</Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </li>
        )}

      </ul>
      <div className="navbar-actions">
        {username && (
          <span className="username-display">
            {username}
          </span>
        )}
        <button className="logout-btn" onClick={handleLogout}>התנתק</button>
      </div>
    </nav>
  );
};

export default Navbar;
