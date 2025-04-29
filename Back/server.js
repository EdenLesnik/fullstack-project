const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // ייבוא Mongoose
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require("./middlewares/authMiddleware");

require('dotenv').config(); // טוען משתני סביבה מקובדץ .env

const callsRouter = require('./functions/Calls/route');
const settingRouter = require('./functions/Setting/route');
const migrateRouter = require('./functions/Migrate/route');
const userRouter = require('./functions/Users/routes/route');
const User = require('./functions/Users/models/user.model')
const Call = require('./functions/Calls/Models/call.model'); // וודא שהנתיב נכון
const ServerSettings = require('./functions/Setting/Models/setting.model')


const app = express();
const HOST = '0.0.0.0';

// הפעלת CORS
app.use(cors());

// Middleware לטיפול ב-JSON
app.use(express.json());

app.use('/migrate', migrateRouter);

app.use('/setting', authMiddleware, settingRouter);

//משתמשים
app.use('/users', authMiddleware, userRouter);

// ניתוב קריאות
app.use('/calls', authMiddleware, callsRouter);

app.post('/call', async (req, res) => {
    const { name, email, message , phone, catagory, forMe , dep } = req.body;

    try {
        const newCall = new Call({
            name,
            email,
            message,
            status: 'חדש', // התחלת הסטטוס כ"חדש"
            phone,
            dep,
            forMe,
            catagory,
            handler: '-',
            isArchived: false,
        });
        await newCall.save(); // שמירת הקריאה במסד הנתונים
        console.log(`Received call from ${name} (${email}): ${message}`);
        res.status(200).json({ success: true, message: 'Call received and saved!' });
    } catch (error) {
        console.error('Error saving call:', error);
        res.status(500).json({ success: false, message: 'Failed to save call' });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
     

        // בדיקת קיום המשתמש
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // השוואת סיסמאות
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // יצירת טוקן
        const token = jwt.sign({ id: user._id, username: user.username , role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});
//------ Depcat
// ✅ שליפת כל המחלקות והקטגוריות
app.get('/departments-categories', async (req, res) => {
    try {
      const settings = await ServerSettings.findOne();
      
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
  
      res.json({
        departments: settings.departments || [],
        supportCategories: settings.supportCategories || [],
      });
    } catch (error) {
      console.error("❌ Error fetching departments and categories:", error);
      res.status(500).json({ error: 'Failed to fetch departments and categories' });
    }
  });
// התחברות ל-MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Could not connect to MongoDB", err));

// שרת מאזין
const PORT = process.env.PORT || 3000;
app.listen(PORT, HOST, () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();

  console.log("\n--- Server Network Information ---");
  Object.keys(networkInterfaces).forEach((iface) => {
      networkInterfaces[iface].forEach((details) => {
          if (details.family === 'IPv4' && !details.internal) {
              console.log(`🌍 Accessible at: http://${details.address}:${PORT}`);
          }
      });
  });

  console.log(`\n📌 Server is running on http://${HOST}:${PORT}`);
});
