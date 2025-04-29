import React, { useState, useEffect } from 'react';
import './style.css';  // וודא שקובץ הסגנון מחובר כראוי
import logo from './Images/Logo.png'; // וודא שהנתיב ללוגו נכון
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const url = `${config.url}`; // עדכון הנתיב החדש

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate(); 

  useEffect(() => {
    document.body.classList.add('login-background');

    return () => {
      document.body.classList.remove('login-background');
    };
  }, []);
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp > currentTime) {
        return <Navigate to="/dashboard" replace />;
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Logging in with:', email, password);
    console.log(url+'login');
    try {
      const response = await fetch(url+'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      console.log(result);

      // שמירת הטוקן בלוקאל סטורג' אם קיים
   
        localStorage.setItem('token', result.token);

      navigate('/dashboard'); // ניתוב לדשבורד
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  return (
    <>
      <div className="second-logo">
        <h1>Oren Mizrah</h1>
      </div>
      <div className="support-logo">
        <h1>Support</h1>
      </div>
      <div className="logo-login">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="login-container">
        <div className="form-container-login">
          <h1 className="form-title-log">התחברות</h1>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">דוא"ל</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}

                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">סיסמה</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}

                required
              />
            </div>

            <button type="submit" className="form-button-log">התחבר</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
