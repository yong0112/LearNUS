const { getUserProfile, updateUserProfile } = require("../models/userModel");

const fetchUserProfile = async (req, res) => {
  const uid = req.params.uid;

  try {
    const user = await getUserProfile(uid);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { uid, newEmail } = req.body();

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(newEmail && { newEmail }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);

    res.status(200).json({ message: "User profile updates successfully " });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update user profile", details: err.message });
  }
};

module.exports = { fetchUserProfile, updateUser };
