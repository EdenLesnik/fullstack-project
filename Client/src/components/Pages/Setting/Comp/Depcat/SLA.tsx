import { useState, useEffect } from 'react';
import './style.css';
import Navbar from '../../../../Nav/nav';
import config from '../../../../../config';
import SLogo from '../../../../assest/SuppoortLogo/SLogo';

const url = config.url + 'setting'; // הנתיב ל-API

const Depcat = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [supportCategories, setSupportCategories] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const token = localStorage.getItem("token"); // קבלת הטוקן

  useEffect(() => {
    document.body.classList.add('dash-board-background');
    fetchSettings(); // שליפת הנתונים בעת טעינת הדף

    return () => {
      document.body.classList.remove('dash-board-background');
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${url}/sla`, {
        headers: {
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setDepartments(data.departments || []);
      setSupportCategories(data.supportCategories || []);
      setLoading(false);
    } catch (err) {
      setError('שגיאה בטעינת הנתונים');
      setLoading(false);
    }
  };

  const addDepartment = async () => {
    if (!newDepartment.trim()) return;
    try {
      const response = await fetch(`${url}/settings/add-department`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
        body: JSON.stringify({ department: newDepartment }),
      });

      if (!response.ok) throw new Error('Failed to add department');
      setDepartments([...departments, newDepartment]);
      setNewDepartment('');
    } catch (err) {
      setError('שגיאה בהוספת מחלקה');
    }
  };

  const removeDepartment = async (department: string) => {
    try {
      const response = await fetch(`${url}/settings/remove-department`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
        body: JSON.stringify({ department }),
      });

      if (!response.ok) throw new Error('Failed to remove department');
      setDepartments(departments.filter((dep) => dep !== department));
    } catch (err) {
      setError('שגיאה במחיקת מחלקה');
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await fetch(`${url}/settings/add-category`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (!response.ok) throw new Error('Failed to add category');
      setSupportCategories([...supportCategories, newCategory]);
      setNewCategory('');
    } catch (err) {
      setError('שגיאה בהוספת קטגוריה');
    }
  };

  const removeCategory = async (category: string) => {
    try {
      const response = await fetch(`${url}/settings/remove-category`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
        },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) throw new Error('Failed to remove category');
      setSupportCategories(supportCategories.filter((cat) => cat !== category));
    } catch (err) {
      setError('שגיאה במחיקת קטגוריה');
    }
  };

  return (
    <>
      <Navbar />
      <SLogo />

      <div className="settings-page">
            <h2 className="setting-depcat-title">קטגוריות ומחלוקות</h2>
        <div className="settings-container" style={{ direction: 'rtl' }}>
          

          {loading ? (
            <p>טוען...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="form-wrapper">
              {/* טבלה למחלקות */}
              <div className="form-container">
                <h2 className="depcat-title-group">מחלקות</h2>
                <div className="input-group">
                  <ul>
                    {departments.map((dep, index) => (
                      <li key={index}>
                        <div className="depped">
                          {dep}
                          <button className="delete-dep" onClick={() => removeDepartment(dep)}>🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="הוסף מחלקה חדשה"
                  />
                  <button className="add-btn" onClick={addDepartment}>➕</button>
                </div>
              </div>

              {/* טבלה לקטגוריות */}
              <div className="form-container">
                <h2 className="depcat-title-group">קטגוריות</h2>
                <div className="input-group">
                  <ul>
                    {supportCategories.map((cat, index) => (
                      <li key={index}>
                        <div className="depped">
                          {cat}
                          <button className="delete-dep" onClick={() => removeCategory(cat)}>🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="הוסף קטגוריה חדשה"
                  />
                  <button className="add-btn" onClick={addCategory}>➕</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Depcat;
