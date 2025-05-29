const db = require("../config/firebase");

const getUserProfile = async (uid) => {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new Error("404 User not found");
  }

  return { id: userDoc.id, ...userDoc.data() };
};

module.exports = { getUserProfile };
