import { useState, useEffect } from 'react';
import './style.css';
import Navbar from '../../../../Nav/nav';
import config from '../../../../../config';
import SLogo from '../../../../assest/SuppoortLogo/SLogo';

const url = config.url + 'setting'; // הנתיב ל-API

const SLA = () => {
  const [slaResponseTime, setSlaResponseTime] = useState(
    localStorage.getItem('slaResponseTime') || ''
  );
  const [slaResolutionTime, setSlaResolutionTime] = useState(
    localStorage.getItem('slaResolutionTime') || ''
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token"); // קבלת הטוקן
  
  if (!token) {
    console.error("No token found, redirecting to login...");
    return; // אם אין טוקן, אפשר להפנות את המשתמש לדף ההתחברות
  }

  useEffect(() => {
    document.body.classList.add('dash-board-background');  
    return () => {
      document.body.classList.remove('dash-board-background');
    };
  }, []);

  // שליפת נתוני SLA מהשרת רק אם הם לא קיימים ב-localStorage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(url,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
          },
        });
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();

        setSlaResponseTime(data.slaResponseTime);
        setSlaResolutionTime(data.slaResolutionTime);

        // שמירת הנתונים ב-localStorage
        localStorage.setItem('slaResponseTime', data.slaResponseTime);
        localStorage.setItem('slaResolutionTime', data.slaResolutionTime);

        setLoading(false);
      } catch (err) {
        setError('Error fetching settings');
        setLoading(false);
      }
    };

    if (!localStorage.getItem('slaResponseTime')) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  // עדכון נתוני SLA ושמירתם גם ב-localStorage
  const handleSave = async () => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
        body: JSON.stringify({
          slaResponseTime: Number(slaResponseTime),
          slaResolutionTime: Number(slaResolutionTime),
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      // עדכון localStorage כדי למנוע משיכות מיותרות
      localStorage.setItem('slaResponseTime', slaResponseTime);
      localStorage.setItem('slaResolutionTime', slaResolutionTime);

      alert('SLA settings updated successfully!');
    } catch (err) {
      alert('Error updating SLA settings');
    }
  };

  return (
    <>
      <Navbar />
      <SLogo/>


      <div className="settings-container" style={{direction: 'rtl'}}>
        <div className="form-container">
          <h1 className="form-title-sll">הגדרות SLA</h1>

          {loading ? (
            <p>טוען...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <form>
              <div className="input-group">
                <label>זמן תגובה SLA (בדקות):</label>
                <input
                  type="number"
                  value={slaResponseTime}
                  onChange={(e) => setSlaResponseTime(e.target.value)}
                  placeholder="לדוגמה: 30"
                />
              </div>

              <div className="input-group">
                <label>זמן פתרון SLA (בדקות):</label>
                <input
                  type="number"
                  value={slaResolutionTime}
                  onChange={(e) => setSlaResolutionTime(e.target.value)}
                  placeholder="לדוגמה: 120"
                />
              </div>

              <button type="button" className="form-button" onClick={handleSave}>
                שמור הגדרות
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default SLA;
