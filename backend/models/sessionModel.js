const { db } = require("../config/firebase");

const getUserSession = async (uid, cid) => {
  const sessionDoc = await db
    .collection("users")
    .doc(uid)
    .collection("classes")
    .doc(cid)
    .get();

  if (!sessionDoc.exists) {
    throw new Error("404 Session not found");
  }

  return { id: sessionDoc.id, ...sessionDoc.data() };
};

const updateUserSessionField = async (uid, cid, updateData) => {
  const classRef = db
    .collection("users")
    .doc(uid)
    .collection("classes")
    .doc(cid);
  await classRef.update(updateData);
};

module.exports = { getUserSession, updateUserSessionField };
