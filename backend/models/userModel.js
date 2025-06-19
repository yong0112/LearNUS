const { db } = require("../config/firebase");

const getUserProfile = async (uid) => {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new Error("404 User not found");
  }

  return { id: userDoc.id, ...userDoc.data() };
};

const updateUserProfile = async (uid, updateDate) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.update(updateDate);
  return true;
}

module.exports = { getUserProfile, updateUserProfile };
