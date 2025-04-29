import { useState, useEffect } from 'react';
import './style.css';
import logo from '../../assest/Images/Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../Nav/nav';
import config from '../../../config';
const url = config.url;

interface Complaint {
  _id: string;
  name: string;
  message: string;
  email: string;
  phone: string;
  dep: string;
  forMe: boolean;
  totalHandle: string;
  handler: string;
  handlingStartedAt: string;
  receivedAt: string;
  catagory: string;
  status: string;
}

const Archive = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const token = localStorage.getItem("token"); // קבלת הטוקן מה-LocalStorage
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>(""); // לשמירת הפעולה שנבחרה

  const [currentPage, setCurrentPage] = useState(1); // עמוד נוכחי
  const itemsPerPage = 10; // מספר הקריאות שיוצגו בעמוד
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstItem, indexOfLastItem);
  
  if (!token) {
    console.error("No token found, redirecting to login...");
    return; // אם אין טוקן, ניתן להפנות את המשתמש לדף ההתחברות או להציג הודעה
  }
  useEffect(() => {
    const fetchData = async () => {
  
      try {
        const response = await fetch(url + "calls/archive", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // שליחת הטוקן לאימות
          },
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data: Complaint[] = await response.json();
        console.log("נתונים שהתקבלו מהשרת:", data);
        setComplaints(data.reverse());

      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    document.body.classList.add('dashboard-background');
  
    return () => {
      document.body.classList.remove('dashboard-background');
    };
  }, []);
  
  const viewDetails = (complaint: Complaint) => {
    if (selectedComplaint && selectedComplaint._id === complaint._id) {
      setSelectedComplaint(null);
    } else {
      setSelectedComplaint(complaint);
    }
  };

  const closeDetails = () => {
    setSelectedComplaint(null);
  };

  const deleteComplaint = async (id: string) => {
        try {
            const response = await fetch(`${url}calls/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // שליחת הטוקן לאימות
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete complaint');
            }

            // עדכון הסטייט - הסרה מיידית של הקריאה מהתצוגה
            setComplaints((prev) => prev.filter((complaint) => complaint._id !== id));

            toast.success('הקריאה נמחקה לצמיתות בהצלחה!', {
                position: 'top-center',
                closeButton: false, // אין כפתור "X" לסגירה
            });
        } catch (error) {
            console.error('Error deleting complaint:', error);
            toast.error('שגיאה במחיקת הקריאה.', {
                position: 'top-center',
                closeButton: false, // אין כפתור "X" לסגירה
            });
        }
    };

    const toggleSelectComplaint = (id: string) => {
      setSelectedComplaints((prev) =>
        prev.includes(id) ? prev.filter((complaintId) => complaintId !== id) : [...prev, id]
      );
    };

  const confirmDelete = (id: string) => {
    toast.info(
      <div className="delete-toast-wrap">
        <p>האם אתה בטוח שברצונך למחוק את הקריאה לצמיתות?</p>
        <div className="delete-toast" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <button
            onClick={() => {
              deleteComplaint(id);
              toast.dismiss();
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            כן
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              padding: '5px 10px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            לא
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const toggleSelectAll = () => {
    if (selectedComplaints.length === complaints.length) {
      setSelectedComplaints([]); // אם הכל מסומן, נבטל את הכל
    } else {
      setSelectedComplaints(complaints.map((c) => c._id)); // אם לא, נסמן את כל הרשומות
    }
  };
    const archiveComplaint = async (id: string) => {
      try {
        const response = await fetch(`${url}calls/delete/${id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to archive complaint');
        }
    
        // עדכון הסטייט - הסרה מהתצוגה של קריאות שמועברות לארכיון
        setComplaints((prev) => prev.filter((complaint) => complaint._id !== id));
    
        toast.success('הקריאה נמחקה לצמיתות!', {
          position: 'top-center',
          closeButton: false, // אין כפתור "X" לסגירה
        });
      } catch (error) {
        console.error('Error archiving complaint:', error);
        toast.error('שגיאה בהעברת הקריאה לארכיון.', {
          position: 'top-center',
          closeButton: false, // אין כפתור "X" לסגירה
        });
      }
    };
  const handleBulkAction = async () => {
    if (!bulkAction) return;
  
    if (selectedComplaints.length === 0) {
      toast.error("לא נבחרו קריאות לביצוע הפעולה.", { position: "top-center" });
      return;
    }
  
    switch (bulkAction) {
      case "delete":
        selectedComplaints.forEach((id) => archiveComplaint(id));
        break;
      default:
        toast.error("בחר פעולה תקפה.", { position: "top-center" });
    }
  
    setSelectedComplaints([]); // ניקוי הבחירה אחרי ביצוע
  };
  return (
    <>
    <Navbar /> 
      <ToastContainer />
      <div className="logo-list">
          <img src={logo} alt="Logo" />
      </div>

      {selectedComplaints.length > 0 && (
      <div className={`bulk-actions-container-archive ${selectedComplaints.length > 0 ? "visible" : ""}`}>
        <select className="bulk-select-archive" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
          <option value="">בחר פעולה...</option>
          <option value="delete">מחיקה</option>
        </select>
        <button className="bulk-action-button-archive" onClick={handleBulkAction} disabled={!bulkAction}>
          בצע 
        </button>
      </div>
    )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
            <th style={{ width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  className="check-dash-th checktop"
                  onChange={toggleSelectAll}
                  checked={selectedComplaints.length === complaints.length && complaints.length > 0}
                />
              </th>
              <th>שם</th>
              <th>מטפל</th>
              <th>תיאור</th>
              <th>נפתח בתאריך</th>
              <th >זמן הטיפול</th>
              <th> </th>
            </tr>
          </thead>
          <tbody className="tbody-dash">
            {currentComplaints.map((complaint, index) => (

              <tr key={complaint._id} className={index % 2 === 0 ? 'white-background table-row' : 'white-background table-row'}>
               <td style={{ textAlign: "center" }}>
                  <input
                    className="check-dash"
                    type="checkbox"
                    checked={selectedComplaints.includes(complaint._id)}
                    onChange={() => toggleSelectComplaint(complaint._id)}
                  />
                </td>
                <td>{complaint.name}</td>
                <td>{complaint.handler}</td>
                <td>{complaint.message.length > 20 ? complaint.message.substring(0, 20) + "..." : complaint.message}</td>
                <td>{new Date(complaint.receivedAt).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
              }).replace(',', '')}</td>
                <td>
            
                    {complaint.totalHandle}
                 
                </td>
                <td className="teador">
                  <div className={`actions-container actions-vertical white-background-icons`}>
                    <button className="icon-button" title="צפייה" onClick={() => viewDetails(complaint)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="icon-button" title="מחיקה" onClick={() => confirmDelete(complaint._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container-dash">
      <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(complaints.length / itemsPerPage)}
        >
          &lt;
        </button>
        <span>עמוד {currentPage} מתוך {Math.ceil(complaints.length / itemsPerPage)}</span>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &gt;
        </button>
        
      </div>
      {selectedComplaint && (
        <div className="details-card open">
          <div className="details-card-content">
            <button className="close-button" onClick={closeDetails}>
              &times;
            </button>
            <div className="Details">
              <h2>פרטים</h2>
              <p>
                <strong>שם:</strong> {selectedComplaint.name}
              </p>
              <p>
                <strong>אימייל:</strong> {selectedComplaint.email}
              </p>
              <p>
                <strong>פלאפון:</strong> {selectedComplaint.phone}
              </p>
              <p>
                <strong>מחלקה:</strong> {selectedComplaint.dep}
              </p>
              <p>
                <strong>קטגוריה:</strong> {selectedComplaint.catagory}
              </p>
              <p>
                <strong>סטטוס:</strong> {selectedComplaint.status}
              </p>
              <p>
                <strong>תיאור:</strong>
              </p>
              <p>
              {selectedComplaint.message.match(/.{1,33}/g)?.map((chunk, index) => (
                <span key={index}>
                  {chunk}
                  <br />
                </span>
              ))}
            </p>
            </div>
            <div className="Message">
              <h2>שליחת מייל</h2>
              <label htmlFor="message">
                <strong>הודעה:</strong>
              </label>
              <input
                type="text"
                id="message"
                className="send-button"
                name="message"
                value=""
              />
              <div className="buttons">
              <button className="send-but">שלח מייל</button>
              <button className="delete-but">מחק קריאה</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default Archive;
