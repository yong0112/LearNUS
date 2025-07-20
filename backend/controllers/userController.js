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

const updateUserProfilePic = async (req, res) => {
  const { uid, profilePicture } = req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(profilePicture && { profilePicture: profilePicture }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);

    res
      .status(200)
      .json({ message: "User profile picture updates successfully " });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update user profile picture",
      details: err.message,
    });
  }
};

const updateUserQR = async (req, res) => {
  const { uid, QR } = req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(QR && { QR: QR }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);

    res.status(200).json({ message: "User payment QR updates successfully " });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update user payment QR",
      details: err.message,
    });
  }
};

module.exports = { fetchUserProfile, updateUserProfilePic, updateUserQR };
