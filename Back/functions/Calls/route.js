const express = require('express');
const router = express.Router();
const Call = require('./Models/call.model'); // וודא שהנתיב נכון

router.get('/allcalls', async (req, res) => {
    const nameFilter = req.query.name; // שם שהועבר כפרמטר ב-query string

    try {
        let query = { isArchived: { $ne: true } };
        if (nameFilter) {
            query.name = { $regex: nameFilter, $options: 'i' }; // סינון לפי שם, עם אופציה ל-case insensitive
        }
        const calls = await Call.find(query); // שליפת הקריאות לפי הסינון
        res.status(200).json(calls);
    } catch (error) {
        console.error('Error retrieving calls:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve calls' });
    }
});

router.get('/archive', async (req, res) => {
    const nameFilter = req.query.name; // שם שהועבר כפרמטר ב-query string

    try {
        let query = { isArchived: { $ne: false } };
        if (nameFilter) {
            query.name = { $regex: nameFilter, $options: 'i' }; // סינון לפי שם, עם אופציה ל-case insensitive
        }
        const calls = await Call.find(query); // שליפת הקריאות לפי הסינון
        res.status(200).json(calls);
    } catch (error) {
        console.error('Error retrieving calls:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve calls' });
    }
});

router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { status, handler } = req.body;
    const user = req.user; // המידע מהטוקן

    try {
        const call = await Call.findById(id);

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }
        
        // ✅ עדכון המטפל אם קיים
        if (handler) {
            call.handler = handler;
        }
        
        // 🟢 אם נשלח רק handler, עדכן רק אותו ושמור על הסטטוס הקיים
        if (handler && !status) {
            await call.save();
            return res.status(200).json({ 
                success: true, 
                handler: call.handler, 
                status: call.status 
            });
        }
        
        // 🔁 המשך טיפול בעדכון סטטוס
        const statusCycle = ['חדש', 'בטיפול', 'טופל'];
        const currentIndex = statusCycle.indexOf(call.status);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        
        if (nextStatus === "בטיפול") {
            call.handlingStartedAt = new Date().toISOString();
        }
        
        if (nextStatus === "טופל") {
            const handlingStart = call.handlingStartedAt || call.receivedAt;
            const diffMs = new Date().getTime() - new Date(handlingStart).getTime();
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            call.totalHandle = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        call.status = nextStatus;
        await call.save();
        
        res.status(200).json({ 
            success: true, 
            status: nextStatus, 
            handler: call.handler, 
            handlingStartedAt: call.handlingStartedAt, 
            totalHandle: call.totalHandle 
        });
        
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});


router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCall = await Call.findByIdAndDelete(id);

        if (!deletedCall) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        res.status(200).json({ success: true, message: 'Call permanently deleted' });
    } catch (error) {
        console.error('Error deleting call:', error);
        res.status(500).json({ success: false, message: 'Failed to delete call' });
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
        const updatedCall = await Call.findByIdAndUpdate(
            id,
            { isArchived: true }, // עדכון השדה isArchived ל-true במקום מחיקה
            { new: true } // מחזיר את המסמך המעודכן
        );

        if (!updatedCall) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        res.status(200).json({ success: true, message: 'Call archived successfully' });
    } catch (error) {
        console.error('Error archiving call:', error);
        res.status(500).json({ success: false, message: 'Failed to archive call' });
    }
});

module.exports = router;

