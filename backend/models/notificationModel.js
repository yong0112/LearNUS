const { db } = require("../config/firebase");

const sendNoti = async (uid, title, message, userId, sessionId) => {
  try {
    const docRef = await db
      .collection("users")
      .doc(uid)
      .collection("notification")
      .add({ title, message, userId, sessionId, isRead: false });
    console.log("Document created with ID:", docRef.id);
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error("Error uploading notifications: ", error);
    throw new Error("Failed to upload notifications");
  }
};

const fetchNoti = async (uid) => {
  const notiRef = await db
    .collection("users")
    .doc(uid)
    .collection("notification")
    .get();

  if (notiRef.empty) {
    return [];
  }

  const notifications = notiRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return notifications;
};

const updateNoti = async (uid, nid, updateData) => {
  const notiRef = db
    .collection("users")
    .doc(uid)
    .collection("notification")
    .doc(nid);
  await notiRef.update(updateData);
};

module.exports = { sendNoti, fetchNoti, updateNoti };
