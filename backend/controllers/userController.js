const { getUserProfile } = require("../models/userModel");

const fetchUserProfile = async (req, res) => {
  const uid = req.params.uid;

  try {
    const user = await getUserProfile(uid);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = { fetchUserProfile };
