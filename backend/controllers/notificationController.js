const {
  fetchNoti,
  sendNoti,
  updateNoti,
} = require("../models/notificationModel");

const uploadUserNoti = async (req, res) => {
  const { uid, title, message, peopleId, sessionId } = req.body;

  if (!uid || !title || !message || !peopleId || !sessionId) {
    return res.status(400).json({ error: "Missing params in the request." });
  }

  try {
    const notifications = await sendNoti(
      uid,
      title,
      message,
      peopleId,
      sessionId,
    );
    res.status(201).json({ message: "Notification added", notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchUserNoti = async (req, res) => {
  const uid = req.params.uid;

  try {
    const notifications = await fetchNoti(uid);
    res.json(notifications);
  } catch (err) {
    res.status(404).json({ message: "No notifications" });
  }
};

const updateUserNoti = async (req, res) => {
  const { uid, nid, isRead } = req.body;

  if (!uid || !nid) {
    return res
      .status(400)
      .json({ error: "Missing parameters in the request." });
  }

  try {
    const updatedData = {
      ...(isRead && { isRead: isRead }),
    };

    await updateNoti(uid, nid, updatedData);

    res.json({ message: "Notifications read updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadUserNoti, fetchUserNoti, updateUserNoti };
