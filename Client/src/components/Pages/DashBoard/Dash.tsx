import { useState, useEffect } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../Nav/nav';
import config from '../../../config';
import SLogo from '../../assest/SuppoortLogo/SLogo'
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { faList, faBell, faTools, faCheckCircle, faBan } from "@fortawesome/free-solid-svg-icons";

const url = config.url;


interface Complaint {
  _id: string;
  name: string;
  message: string;
  email: string;
  phone: string;
  dep: string;
  forMe: boolean;
  handlingStartedAt: string;
  totalHandle: string;
  catagory: string;
  handler: string;
  receivedAt: string;
  status: string;
}

interface User {
  _id: string;
  username: string;
}

const Dash = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<{ [key: string]: string }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [editingHandlerId, setEditingHandlerId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null); // שמירת שם המשתמש
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>(""); // לשמירת הפעולה שנבחרה
  const [currentPage, setCurrentPage] = useState(1); // עמוד נוכחי
  const itemsPerPage = 10; // מספר הקריאות שיוצגו בעמוד
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [slaResponseTime, setSlaResponseTime] = useState<number>(
    Number(localStorage.getItem('slaResponseTime')) || 2 // ודא שברירת המחדל היא 2 דקות
  );
  const [slaResolutionTime, setSlaResolutionTime] = useState<number>(
    Number(localStorage.getItem('slaResolutionTime')) || 120
  );
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const token = localStorage.getItem("token"); // קבלת הטוקן



  const toggleStatusSelection = (status: string) => {
    setSelectedStatuses((prev) => {
      const newStatuses = new Set(prev);
      if (status === "הכל") {
        return new Set(); // בחירת "הכל" מנקה את הסינון
      } else {
        if (newStatuses.has(status)) {
          newStatuses.delete(status);
        } else {
          newStatuses.add(status);
        }
        return newStatuses;
      }
    });
  };
  
  // סינון הקריאות לפי הסטטוס שנבחר
  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(complaint.status);
    const matchesSearch = searchQuery === "" || 
      complaint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.catagory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.message.toLowerCase().includes(searchQuery.toLowerCase());
  
    return matchesStatus && matchesSearch;
  });
  
  
  // מבנה הקלפים
  const statusFilters = [
    { label: "לא רלוונטי", icon: faBan, color: "#ff9500", count: complaints.filter(c => c.status === "לא רלוונטי").length },
    { label: "טופל", icon: faCheckCircle, color: "#8e8e93", count: complaints.filter(c => c.status === "טופל").length },
    { label: "בטיפול", icon: faTools, color: "#ffcc00", count: complaints.filter(c => c.status === "בטיפול").length },
    { label: "חדש", icon: faBell, color: "#007aff", count: complaints.filter(c => c.status === "חדש").length },
    { label: "הכל", icon: faList, count: complaints.length }
  ];
  
  
  if (!token) {
    console.error("No token found, redirecting to login...");
    return; // אם אין טוקן, אפשר להפנות את המשתמש לדף ההתחברות
  }
  let currentUser = "";
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      currentUser = decoded.username; // השם של המשתמש המחובר
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  const handleSort = (field: keyof Complaint) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  
    const sortedComplaints = [...complaints].sort((a, b) => {
      const aValue = a[field]?.toString().toLowerCase();
      const bValue = b[field]?.toString().toLowerCase();
  
      if (aValue < bValue) return newSortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
    setComplaints(sortedComplaints);
  };
  const toggleSelectComplaint = (id: string) => {
    setSelectedComplaints((prev) =>
      prev.includes(id) ? prev.filter((complaintId) => complaintId !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    if (selectedComplaints.length === complaints.length) {
      setSelectedComplaints([]); // אם הכל מסומן, נבטל את הכל
    } else {
      setSelectedComplaints(complaints.map((c) => c._id)); // אם לא, נסמן את כל הרשומות
    }
  };
  const handleBulkAction = async () => {
    if (!bulkAction) return;
  
    if (selectedComplaints.length === 0) {
      toast.error("לא נבחרו קריאות לביצוע הפעולה.", { position: "top-center" });
      return;
    }
  
    try {
      switch (bulkAction) {
        case "delete":
          await Promise.all(
            selectedComplaints.map((id) => archiveComplaint(id, false)) // 🔇 לא מציג toast
          );
          toast.success("הקריאות הועברו לארכיון בהצלחה!", { position: "top-center" });
          break;
  
        case "mark-in-progress":
          await Promise.all(
            selectedComplaints.map((id) => updateStatus(id, "בטיפול"))
          );
          toast.success("הקריאות סומנו כ'בטיפול'!", { position: "top-center" });
          break;
  
        case "mark-resolved":
          await Promise.all(
            selectedComplaints.map((id) => updateStatus(id, "טופל"))
          );
          toast.success("הקריאות סומנו כ'טופל'!", { position: "top-center" });
          break;
  
        default:
          toast.error("בחר פעולה תקפה.", { position: "top-center" });
      }
    } catch (error) {
      toast.error("אירעה שגיאה בביצוע הפעולה.", { position: "top-center" });
      console.error("Bulk action error:", error);
    }
  
    setSelectedComplaints([]);
  };
  
  const assignHandler = async (complaintId: string, handlerName: string) => {
    try {
      const response = await fetch(`${url}calls/update/${complaintId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handler: handlerName }),
      });

      if (!response.ok) throw new Error('Failed to assign handler');

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, handler: handlerName } : complaint
        )
      );
      setEditingHandlerId(null); // סגירת ה-select אחרי עדכון
    } catch (error) {
      console.error('Error assigning handler:', error);
    }
  };
  useEffect(() => {
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(1); // או אפשר גם totalPages אם אתה רוצה להישאר בעמוד האחרון האפשרי
    }
  }, [filteredComplaints]);
  
  useEffect(() => {
    
    const fetchSlaSettings = async () => {
      try {
        const response = await fetch(url + 'setting/sla', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch SLA settings');
        const data = await response.json();
  
        setSlaResponseTime(data.slaResponseTime);
        setSlaResolutionTime(data.slaResolutionTime); // עדכון זמן פתרון SLA
  
        localStorage.setItem('slaResponseTime', data.slaResponseTime);
        localStorage.setItem('slaResolutionTime', data.slaResolutionTime);
      } catch (error) {
        console.error('Failed to fetch SLA settings:', error);
      }
    };
    getRole();
    fetchUsers();
    fetchSlaSettings();
  }, []);
  const getRole = async () => {
    if (token) {
      try {
        const decoded: { role: string } = jwtDecode(token);
        setRole(decoded.role);
        console.log(decoded.role+ "= ROLE")
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }
  const fetchUsers = async () => {
    try {
        const response = await axios.get(`${url}users/users`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
              },
        });
        setUsers(response.data);  
   
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};
  useEffect(() => {
    const updateElapsedTime = () => {
      setTimeElapsed((_prevTimes) => {
        const updatedTimes: { [key: string]: string } = {};
        complaints.forEach((complaint) => {
          if (complaint.status === "חדש") {
            updatedTimes[complaint._id] = getTimeElapsed(complaint.receivedAt);
          } else if (complaint.status === "בטיפול") {
            updatedTimes[complaint._id] = getTimeElapsed(complaint.handlingStartedAt || complaint.receivedAt);
          } else if (complaint.status === "טופל") {
            updatedTimes[complaint._id] = timeElapsed[complaint._id] || "00:00:00"; // שמירת הזמן הסופי
          }
        });
  
        return updatedTimes;
      });
    };
  
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
  
    return () => clearInterval(interval);
  }, [complaints]);
  
  


  const getTimeElapsed = (startTime: string | undefined): string => {
    if (!startTime) return "00:00:00"; // אם אין זמן – החזר 0
  
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
  
    if (isNaN(start) || start > now) return "00:00:00"; // תאריך שגוי או עתידי
  
    const diffMs = now - start;
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  

  useEffect(() => {
    const fetchData = async () => {

  
      try {
        const response = await fetch(url + "calls/allcalls", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // שליחת הטוקן לכותרת Authorization
          },
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data: Complaint[] = await response.json();
        console.log("נתונים שהתקבלו מהשרת:", data);
        setComplaints(data);
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    document.body.classList.add('dash-board-background');
  
    return () => {
      document.body.classList.remove('dash-board-background');
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

  const archiveComplaint = async (id: string, showToast = true) => {
    try {
      const response = await fetch(`${url}calls/delete/${id}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to archive complaint');
      }
  
      setComplaints((prev) => prev.filter((complaint) => complaint._id !== id));
  
      if (showToast) {
        toast.success('הקריאה הועברה לארכיון בהצלחה!', {
          position: 'top-center',
          closeButton: false,
        });
      }
    } catch (error) {
      console.error('Error archiving complaint:', error);
      if (showToast) {
        toast.error('שגיאה בהעברת הקריאה לארכיון.', {
          position: 'top-center',
          closeButton: false,
        });
      }
    }
  };
  

  const confirmDelete = (id: string) => {
    toast.info(
      <div className="delete-toast-wrap">
        <p>האם אתה בטוח שברצונך למחוק את הקריאה?</p>
        <div className="delete-toast" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <button
            onClick={() => {
              archiveComplaint(id, true);

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
  const updateStatus = async (id: string, newStatus: string, handler?: string) => {
    try {
      const response = await fetch(`${url}calls/update/${id}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, handler }), // 📌 שים לב שגם ה-handler נשלח
      });
  
      if (!response.ok) throw new Error('Failed to update status');
  
      const data = await response.json();
  
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id
            ? { 
                ...item, 
                status: newStatus, 
                handler: handler || data.handler, // ✅ עדכון שם המטפל
                handlingStartedAt: data.handlingStartedAt || item.handlingStartedAt,
                totalHandle: data.totalHandle || item.totalHandle
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  
  
  
  return (
    <>
      <div className="dashboard-container">
        {statusFilters.map(({ label, icon, color, count }) => (
          <div
            key={label}
            className={`dashboard-card ${selectedStatuses.has(label) ? "selected" : ""}`}
            onClick={() => toggleStatusSelection(label)}
            style={{ borderColor: selectedStatuses.has(label) ? "#007aff" : "transparent", color: 'black' }}
          >
            <FontAwesomeIcon icon={icon} style={{ fontSize: "30px", marginBottom: "10px", color }} />
            <h2 className="dcard-label">{label}</h2>
            <h4 className="dcard-count">{count}</h4> {/* הצגת כמות הקריאות לכל סטטוס */}
          </div>
        ))}
      </div>



    <Navbar /> 
      <ToastContainer />

      <SLogo/>
      {selectedComplaints.length > 0 && (
        <div className={`bulk-actions-container ${selectedComplaints.length > 0 ? "visible" : ""}`}>
          <select className="bulk-select" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
            <option value="">בחר פעולה...</option>
            <option value="delete">מחיקה</option>
            <option value="mark-in-progress">סמן כבטיפול</option>
            <option value="mark-resolved">סמן כטופל</option>
          </select>
          <button className="bulk-action-button" onClick={handleBulkAction} disabled={!bulkAction}>
            בצע 
          </button>
        </div>
      )}

      <div className="table-container">

        <table className="table">
        <thead>
        <tr className="header-top">
          <th colSpan={9}> {/* התאמת מספר העמודות לטבלה */}
          <input
            className="search-dash"
            placeholder="חפש בקריאות..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          </th>
        </tr>

            <tr className="header-secondary">
            <th style={{ width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  className="check-dash-th checktop"
                  onChange={toggleSelectAll}
                  checked={selectedComplaints.length === complaints.length && complaints.length > 0}
                />
              </th>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                שם פרטי {sortField === "name" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </th>
              <th>תיאור</th>
              <th className="status-th" onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                סטטוס {sortField === "status" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </th>
              <th onClick={() => handleSort("catagory")} style={{ cursor: "pointer" }}>
                נושא {sortField === "catagory" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </th>
              <th onClick={() => handleSort("receivedAt")} style={{ cursor: "pointer" }}>
                התקבל {sortField === "receivedAt" ? (sortOrder === "asc" ? "⬆️" : "⬇️") : ""}
              </th>
              <th>זמן שעבר</th>
              <th>מטפל</th>
              <th> </th>
            </tr>
          </thead>
          <tbody className="tbody-dash">
          {filteredComplaints.map((complaint) => (

              <tr key={complaint._id} className='white-background table-row'>
                  <td style={{ textAlign: "center" }}>
                  <input
                    className="check-dash"
                    type="checkbox"
                    checked={selectedComplaints.includes(complaint._id)}
                    onChange={() => toggleSelectComplaint(complaint._id)}
                  />
                </td>
                <td>{complaint.name}</td>
                <td>{complaint.message.length > 20 ? complaint.message.substring(0, 20) + "..." : complaint.message}</td>

                <td>
                <button
                className={`status-button ${complaint.status}`}
                onClick={() => {
                  if (complaint.status === "חדש" && complaint.handler === "-") {
                    // 🟢 אם הקריאה חדשה וללא מטפל, נעדכן ישירות את המטפל ליוזר הלוחץ
                    updateStatus(complaint._id, "בטיפול", currentUser);
                  } else if (complaint.handler === currentUser) {
                    // 🟢 אם הקריאה **כבר משויכת למשתמש המחובר**, נאפשר לו לשנות סטטוס
                    updateStatus(complaint._id, getNextStatus(complaint.status));
                  } else {
                    // 🔴 אם הקריאה **משויכת למישהו אחר**, לא נאפשר לשנות
                    alert("אין לך הרשאה לשנות את הסטטוס של קריאה זו.");
                  }
                }}
                disabled={complaint.handler !== "-" && complaint.handler !== currentUser} // 🔴 חסימה אם המשתמש אינו המטפל
              >
                {complaint.status}
              </button>

              </td>
                <td>{complaint.catagory}</td>
                <td>{new Date(complaint.receivedAt).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
              }).replace(',', '')}</td>
                <td
                  style={{
                    color: (() => {
                      const elapsed = timeElapsed[complaint._id] || "00:00:00"; // ברירת מחדל

                      if (complaint.status === "טופל") return "blue"; // 🔵 אם הקריאה טופלה, הזמן נשמר בכחול

                      const [hours, minutes] = elapsed.split(":").map(Number);
                      const elapsedMinutes = hours * 60 + minutes;

                      // 🔴 אם הקריאה `חדש` ועבר `slaResponseTime - 1`
                      if (complaint.status === "חדש" && elapsedMinutes >= slaResponseTime - 1) {
                        return "red"; 
                      }

                      // 🔴 אם הקריאה `בטיפול` ועבר `slaResolutionTime - 1`
                      if (complaint.status === "בטיפול" && elapsedMinutes >= slaResolutionTime - 1) {
                        return "red";
                      }

                      return "inherit"; // צבע רגיל אם לא חרג מה-SLA
                    })(),
                  }}
                >
                  {complaint.status === "טופל" ? complaint.totalHandle || "00:00:00" : timeElapsed[complaint._id] || "00:00:00"}
                </td>
              <td style={{ position: "relative" }}>
            {editingHandlerId === complaint._id ? (
              role === "admin" ? (
                <select
                  className="select-handler"
                  onChange={(e) => assignHandler(complaint._id, e.target.value)}
                  onBlur={() => setEditingHandlerId(null)} // סגירה בלחיצה מחוץ ל-SELECT
                  autoFocus
                >
                  <option value="">בחר מטפל</option>
                  {users.map((user) => (
                    <option key={user._id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
                    ) : (
                      <span>{complaint.handler}</span>
                    )
                  ) : role === "admin" ? (
                    <span
                      onClick={() => setEditingHandlerId(complaint._id)}
                      className="handler-text"
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      {complaint.handler === "-" ? "לחץ לשיוך" : complaint.handler}
                    </span>
                  ) : (
                    <span>{complaint.handler === "-" ? "-" : complaint.handler}</span>
                  )}
                </td>


                <td className="teador">
                  <div className={`actions-container actions-vertical white-background-icons`}>
                    <button className="icon-button" title="צפייה" onClick={() => viewDetails(complaint)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="icon-button" title="מחיקה" onClick={() => confirmDelete(complaint._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button className="icon-button" title="עדכון">
                      <FontAwesomeIcon icon={faUpload} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredComplaints.length > 0 && (
        <div className="pagination-container-dash">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span>
            עמוד {currentPage} מתוך {Math.ceil(filteredComplaints.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredComplaints.length / itemsPerPage)}
          >
            &gt;
          </button>
        </div>
      )}

      {selectedComplaint && (
        <div className="details-card open">
          <div className="details-card-content">
            <button className="close-button" onClick={closeDetails}>
              &times;
            </button>
            
            <div className="Details">
              <h2>פרטים</h2>
              <p>
                <strong>שם פרטי:</strong> {selectedComplaint.name}
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

const getNextStatus = (currentStatus: string): string => {
  const statuses = ['חדש', 'בטיפול', 'טופל'];
  const currentIndex = statuses.indexOf(currentStatus);
  return statuses[(currentIndex + 1) % statuses.length];
};

export default Dash;
