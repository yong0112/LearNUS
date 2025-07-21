const { db } = require("../config/firebase");

const getUserProfile = async (uid) => {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new Error("404 User not found");
  }

  return { id: userDoc.id, ...userDoc.data() };
};

const updateUserProfile = async (uid, updateData) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.update(updateData);
  return true;
};

module.exports = { getUserProfile, updateUserProfile };
