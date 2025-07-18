const {
  getUserSession,
  updateUserSessionField,
} = require("../models/sessionModel");

const fetchUserSession = async (req, res) => {
  const uid = req.params.uid;
  const cid = req.params.cid;

  if (!uid || !cid) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const session = await getUserSession(uid, cid);
    res.json(session);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const updateSessionStatus = async (req, res) => {
  const { uid, cid, status } = req.body;

  if (!uid || !cid || !status) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const updatedData = {
      ...(status && { status }),
    };
    await updateUserSessionField(uid, cid, updatedData);
    res.json({ message: "Session updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fetchUserSession, updateSessionStatus };
