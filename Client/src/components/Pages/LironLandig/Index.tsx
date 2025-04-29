import React, { useState, useEffect } from 'react';
import Joi from 'joi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import logo from './Images/Logo.png';
import Rocket from './Images/Rocket.png';
import config from '../../../config';
import confetti from 'canvas-confetti';
import SLogo from '../../assest/SuppoortLogo/SLogo';

const url = config.url;

const Liron: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    catagory: '',
    dep: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [supportCategories, setSupportCategories] = useState<string[]>([]);

  useEffect(() => {
    // הוספת מחלקה ייחודית ל-body
    document.body.classList.add('liron-background');
    fetchDepartmentsAndCategories();
    return () => {
      // הסרת המחלקה כאשר הדף הזה מתחלף
      document.body.classList.remove('liron-background');
    };
  }, []);
  const fetchDepartmentsAndCategories = async () => {
    try {
      const response = await fetch(`${url}departments-categories`);
      if (!response.ok) throw new Error('Failed to fetch data');
  
      const data = await response.json();
      setDepartments(data.departments || []);
      setSupportCategories(data.supportCategories || []);
    } catch (error) {
      console.error('❌ Error fetching departments and categories:', error);
    }
  };
  const toggleSwitch = () => {
    setIsSwitchOn(!isSwitchOn);
  }
const schema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .required()
    .label('שם פרטי')
    .messages({
      'string.empty': 'שם פרטי לא יכול להיות ריק.',
      'string.min': 'שם פרטי חייב להכיל לפחות 3 תווים.',
      'any.required': 'יש למלא את השדה שם פרטי.',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('כתובת מייל')
    .messages({
      'string.empty': 'כתובת מייל לא יכולה להיות ריקה.',
      'string.email': 'כתובת המייל אינה תקינה.',
      'any.required': 'יש למלא את שדה המייל.',
    }),
  message: Joi.string()
    .min(5)
    .max(1000)
    .required()
    .label('פרטי קריאה')
    .messages({
      'string.empty': 'פרטי הקריאה לא יכולים להיות ריקים.',
      'string.min': 'פרטי הקריאה חייבים להכיל לפחות 5 תווים.',
      'any.required': 'יש למלא את שדה פרטי הקריאה.',
    }),
    catagory: Joi.string().required().label('קטגוריה').messages({
      'string.empty': 'יש לבחור קטגוריה.',
    }),
    dep: Joi.string().required().label('מחלקה').messages({
      'string.empty': 'יש לבחור מחלקה.',
    }),
    phone: Joi.string()
    .pattern(/^\d{10}$/) // דורש 10 ספרות בדיוק
    .required()
    .label('מספר פלאפון')
    .messages({
      'string.empty': 'יש להזין מספר פלאפון.',
      'string.pattern.base': 'מספר פלאפון חייב להיות בן 10 ספרות.',
      'any.required': 'יש למלא את שדה מספר פלאפון.',
    }),

    
});


  const validate = () => {
    const { error } = schema.validate(formData, { abortEarly: false });
    if (!error) return null;

    const errorObj: { [key: string]: string } = {};
    error.details.forEach((detail) => {
      if (detail.path[0]) {
        errorObj[detail.path[0] as string] = detail.message;
      }
    });
    return errorObj;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors) {
        setErrors(validationErrors); // מציג הודעות שגיאה
        return;
    }
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        dep: formData.dep,
        forMe: !isSwitchOn, // אם המשתמש בחר "קריאה עבור אדם אחר" אז זה `false`, אחרת `true`
        catagory: formData.catagory, // הקטגוריה נשארת כמחרוזת
        receivedAt: new Date(), // תאריך ברירת מחדל
        status: 'חדש', // ברירת מחדל של סטטוס
    };

    try {
        const response = await fetch(url+'call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:  JSON.stringify(submissionData),
        });

        if (!response.ok) {
            throw new Error('Failed to send the request');
        }

        const responseData = await response.json();
        console.log('Server response:', responseData);
        toast.success('הטופס נשלח בהצלחה!', { position: 'top-center', closeButton: false });
        setFormData({ name: '', email: '', message: '', catagory: '', dep: '', phone: '' }); // מאפס את השדות
    } catch (error) {
        console.error('Error sending request:', error);
        toast.error('שגיאה בשליחת הטופס.', { position: 'top-center', closeButton: false });
    }
};

const launchConfetti = () => {
  const duration = 2 * 1000; // משך הפיצוץ (שתי שניות)
  const end = Date.now() + duration;

  const frame = () => {
      confetti({
          particleCount: 10, // כמות חלקיקים בכל פיצוץ קטן
          angle: Math.random() * 360, // כל חלקיק עף לכיוון אחר
          spread: 90, // פיזור רחב
          origin: { x: 0.5, y: 0.5 }, // מרכז המסך
          colors: ['#ff0000', '#ffbf00', '#ff00ff', '#00ffff', '#ffffff'], // צבעים מלחיצים וחגיגיים
      });

      if (Date.now() < end) {
          requestAnimationFrame(frame);
      }
  };

  frame(); // מתחיל את הפיצוץ
};

  const confirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    setIsToastOpen(true);
    toast.info(
      <div className="toast-of-success">
        <p>האם ברצונך לשלוח את הטופס?</p>
        <ul>
          <li><strong>שם:</strong> {formData.name}</li>
          <li><strong>אימייל:</strong> {formData.email}</li>
          <li><strong>פלאפון:</strong> {formData.phone}</li>
          <li><strong>קטגוריה:</strong> {formData.catagory}</li>
          <li><strong>מחלקה:</strong> {formData.dep}</li>
          <li><strong>הודעה:</strong> {formData.message}</li>
          
        </ul>
        <div className="buttons-toast" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button
            onClick={() => {
                setIsRocketLaunching(true); // מפעיל את השיגור!
                launchConfetti();
                setTimeout(() => {
                    handleSubmit(); // שולח את הטופס אחרי שהרקטה עפה
                    setIsToastOpen(false);
                    setIsRocketLaunching(false); // מאפס את הרקטה אחרי זמן קצר
                }, 2000); // זמן התגובה לפני שהרקטה חוזרת
                toast.dismiss();
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            כן
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              setIsToastOpen(false); // סוגר את הרקטה כשה-toast נסגר
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc3545',
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
      }
    );
  };

  return (
    <>
      <ToastContainer />
      <SLogo/>
      <div className="logo-landing">
        <img src={logo} alt="Logo" className="logo"></img>
      </div>
      <div className={`rocket-container ${isToastOpen ? "launch" : ""} ${isRocketLaunching ? "launching" : ""}`}>
          <img src={Rocket} alt="Rocket" className="rocket" />
      </div>


      
    
      <div className="whole-form">
      
        <div className="content-container">
            <div className="container-call">
            <div className="form-container">
            <h1 className="form-title-log">קריאת שירות</h1>

            <form onSubmit={confirmSubmit}>
                <div className="info-send">
                    <div className="divider-info">
                        
                        <input
                            type="text"
                            placeholder='שם מלא'
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="error-message neededname">{errors.name}</p>}
                    </div>
                    <div className="divider-info">
                    <select
                      id="dep"
                      name="dep"
                      value={formData.dep}
                      onChange={(e) => setFormData({ ...formData, dep: e.target.value })}
                    >
                      <option value="">בחר מחלקה</option>
                      {departments.map((department, index) => (
                        <option key={index} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>

                    {errors.dep && <p className="error-message needed2">{errors.dep}</p>}
             
                    </div>

                </div>

                <div className="info-send">
                <div className={`divider-info ${errors.email ? "has-error" : ""}`}>

                  
                    <input
                        type="email"
                        className="info-input"
                        id="email"
                        placeholder= 'כתובת דוא"ל'
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                {errors.email && <p className="error-message needmail">{errors.email}</p>}
                <div className="divider-info">
                 
                    <input
                        type="text"
                        name="phone" 
                        placeholder='מספר סלולרי '
                        className="info-input"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
           
                {errors.phone && <p className="error-message pelephone">{errors.phone}</p>}
                </div>
                <div>
                <select
                  id="catagories"
                  name="catagory"
                  value={formData.catagory}
                  onChange={(e) => setFormData({ ...formData, catagory: e.target.value })}
                >
                  <option value="">בחר קטגוריה</option>
                  {supportCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                  {errors.catagory && <p className="error-message categoryneed">{errors.catagory}</p>}
                    
                </div>
                <div>
 
                <textarea
                    placeholder='הסבר קצת על הבעיה'
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                ></textarea>
                {errors.message && <p className="error-message needed">{errors.message}</p>}

                </div>
                <div className="switch-container">
                        <label className="switch-label">
                        קריאה עבור אדם אחר
                        <div className={`switch ${isSwitchOn ? 'on' : ''}`} onClick={toggleSwitch}>
                            <div className="switch-toggle"></div>
                        </div>
                        </label>
                    </div>
                <button className="form-button" type="submit">שלח קריאה</button>
            </form>
            </div>
            </div>

           
        </div>
      </div>

    </>
  );
};

export default Liron;
