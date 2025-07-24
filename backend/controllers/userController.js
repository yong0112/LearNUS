const { getUserProfile, updateUserProfile } = require("../models/userModel");
const { db } = require("../config/firebase");

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

const updateRating = async (req, res) => {
  const { uid, ratings } = req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(ratings && { ratings: ratings }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);

    res.status(200).json({ message: "User ratings updates successfully " });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update user ratings",
      details: err.message,
    });
  }
};

const updateFavourites = async (req, res) => {
  const { uid, sessionId } = req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });
  if (!sessionId)
    return res.status(400).json({ error: "Session ID is required" });

  try {
    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();

    let favs = doc.exists && doc.data().favourites ? doc.data().favourites : [];

    if (favs.includes(sessionId)) {
      favs = favs.filter((fav) => fav != sessionId);
    } else {
      favs.push(sessionId);
    }

    const updateData = {
      ...(favs && { favourites: favs }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);
    res.status(200).json({
      message: "User favourites updates successfully ",
      favourites: favs,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update user favourites",
      details: err.message,
    });
  }
};

const setOnboarding = async (req, res) => {
  const { uid, major, teachingMode, budgetCap, profilePicture, onboarded } =
    req.body;

  if (!uid) return res.status(404).json({ error: "UID is required" });

  try {
    const updateData = {
      ...(major && { major: major }),
      ...(teachingMode && { teachingMode: teachingMode }),
      ...(budgetCap && { budgetCap: budgetCap }),
      ...(profilePicture && { profilePicture: profilePicture }),
      ...(onboarded && { onboarded: onboarded }),
      updatedAt: new Date(),
    };

    await updateUserProfile(uid, updateData);

    res.status(200).json({ message: "User onboard successfully " });
  } catch (err) {
    res.status(500).json({
      error: "User failed to onboard",
      details: err.message,
    });
  }
};

module.exports = {
  fetchUserProfile,
  updateUserProfilePic,
  updateUserQR,
  updateRating,
  updateFavourites,
  setOnboarding,
};
