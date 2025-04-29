const express = require('express');
const router = express.Router();
const ServerSettings = require('./Models/setting.model');

// 1️⃣ שליפת הגדרות השרת
router.get('/sla', async (req, res) => {
  try {
    let settings = await ServerSettings.findOne();
    if (!settings) {
      settings = await ServerSettings.create({
        serverName: "Main Server",
        slaResponseTime: 30,
        slaResolutionTime: 120,
        timezone: "Asia/Jerusalem",
      });
    }
    res.json(settings);
  } catch (error) {
    console.error("❌ Error fetching server settings:", error);
    res.status(500).json({ error: 'Failed to fetch server settings' });
  }
});

// 2️⃣ עדכון הגדרות השרת (למשל, שינוי SLA)
router.put('/', async (req, res) => {
  try {
    const { serverName, slaResponseTime, slaResolutionTime, timezone } = req.body;

    let settings = await ServerSettings.findOne();
    if (!settings) {
      settings = new ServerSettings({ serverName, slaResponseTime, slaResolutionTime, timezone });
    } else {
      settings.serverName = serverName || settings.serverName;
      settings.slaResponseTime = slaResponseTime || settings.slaResponseTime;
      settings.slaResolutionTime = slaResolutionTime || settings.slaResolutionTime;
      settings.timezone = timezone || settings.timezone;
    }

    await settings.save();
    res.json({ message: 'Server settings updated successfully', settings });
  } catch (error) {
    console.error("❌ Error updating server settings:", error);
    res.status(500).json({ error: 'Failed to update server settings' });
  }
});
// 3️⃣ הוספת קטגוריה חדשה
router.post('/settings/add-category', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: "Category name is required" });

    const settings = await ServerSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    if (settings.supportCategories.includes(category)) {
      return res.status(400).json({ error: "Category already exists" });
    }

    settings.supportCategories.push(category);
    await settings.save();

    res.status(200).json({ message: "Category added successfully", settings });
  } catch (error) {
    console.error("❌ Error adding category:", error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// 4️⃣ הסרת קטגוריה קיימת
router.post('/settings/remove-category', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: "Category name is required" });

    const settings = await ServerSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    settings.supportCategories = settings.supportCategories.filter(cat => cat !== category);
    await settings.save();

    res.status(200).json({ message: "Category removed successfully", settings });
  } catch (error) {
    console.error("❌ Error removing category:", error);
    res.status(500).json({ error: 'Failed to remove category' });
  }
});

// 5️⃣ הוספת מחלקה חדשה
router.post('/settings/add-department', async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) return res.status(400).json({ error: "Department name is required" });

    const settings = await ServerSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    if (settings.departments.includes(department)) {
      return res.status(400).json({ error: "Department already exists" });
    }

    settings.departments.push(department);
    await settings.save();

    res.status(200).json({ message: "Department added successfully", settings });
  } catch (error) {
    console.error("❌ Error adding department:", error);
    res.status(500).json({ error: 'Failed to add department' });
  }
});

// 6️⃣ הסרת מחלקה קיימת
router.post('/settings/remove-department', async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) return res.status(400).json({ error: "Department name is required" });

    const settings = await ServerSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    settings.departments = settings.departments.filter(dep => dep !== department);
    await settings.save();

    res.status(200).json({ message: "Department removed successfully", settings });
  } catch (error) {
    console.error("❌ Error removing department:", error);
    res.status(500).json({ error: 'Failed to remove department' });
  }
});

module.exports = router;
