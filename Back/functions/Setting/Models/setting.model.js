const mongoose = require('mongoose');

const ServerSettingsSchema = new mongoose.Schema(
  {
    serverName: { type: String, required: true },
    slaResponseTime: { type: Number, required: true, default: 30 }, // זמן מקסימלי לתגובה (בדקות)
    slaResolutionTime: { type: Number, required: true, default: 120 }, // זמן מקסימלי לפתרון (בדקות)
    
    supportCategories: [{ type: String, required: true }], // ⬅️ רשימת קטגוריות תמיכה
    departments: [{ type: String, required: true }], // ⬅️ רשימת מחלקות בארגון
  },
  { timestamps: true } // מוסיף createdAt ו-updatedAt אוטומטית
);

module.exports = mongoose.model('ServerSettings', ServerSettingsSchema);
