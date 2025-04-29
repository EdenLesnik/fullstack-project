import React, { useState, useEffect } from 'react';
import Joi from 'joi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import logo from './Images/Logo.png';
import config from '../../../config';
const url = config.url;


const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // הוספת מחלקה ייחודית ל-body
    document.body.classList.add('landing-page-background');

    return () => {
      // הסרת המחלקה כאשר הדף הזה מתחלף
      document.body.classList.remove('landing-page-background');
    };
  }, []);

  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().label('Name'),
    email: Joi.string().email({ tlds: { allow: false } }).required().label('Email'),
    message: Joi.string().min(5).max(500).required().label('Message'),
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
    try {
      const response = await fetch(url+'/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send the request');
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);
      toast.success('הטופס נשלח בהצלחה!', { position: 'top-center', closeButton: false });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('שגיאה בשליחת הטופס.', { position: 'top-center', closeButton: false });
    }
  };

  const confirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    toast.info(
      <div className="toast-of-success">
        <p>האם ברצונך לשלוח את הטופס?</p>
        <ul>
          <li><strong>שם:</strong> {formData.name}</li>
          <li><strong>אימייל:</strong> {formData.email}</li>
          <li><strong>הודעה:</strong> {formData.message}</li>
        </ul>
        <div className="buttons-toast" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button
            onClick={() => {
              handleSubmit();
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
            onClick={() => toast.dismiss()}
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
      <div className="logo-landing">
        <img src={logo} alt="Logo" className="logo"></img>
      </div>

      <div className="container-call">
        <div className="form-container">
          <h1>קריאת שירות</h1>
          <form onSubmit={confirmSubmit}>
            <div>
              <label htmlFor="name">שם פרטי</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email">כתובת מייל</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message">פרטי קריאה</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
              ></textarea>
              {errors.message && <p className="error-message">{errors.message}</p>}
            </div>

            <button type="submit">שלח קריאה</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
