const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    forMe: { type: Boolean, required: true },
    phone: {type : String, required: true},
    catagory: { type: String, required: true },
    handler: { type: String, default: '-'},
    dep: { type: String, required: false },
    receivedAt: { type: Date, default: Date.now },
    totalHandle: {type: String, default: "00:00:00"},
    handlingStartedAt: {type: String, default: ""},
    isArchived: { type: Boolean, default: false, required: false},
    status: { type: String, default: 'חדש' }  // הוספת שדה סטטוס עם ברירת מחדל של "חדש"
});

const Call = mongoose.model('Call', callSchema, 'calls'); // הקולקשן ב-MongoDB צריך להיות 'calls'

module.exports = Call;
