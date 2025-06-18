const { db } = require("../config/firebase");

const getUserEvents = async (uid) => {
  const eventsRef = await db
    .collection("users")
    .doc(uid)
    .collection("events")
    .get();

  if (eventsRef.empty) {
    return [];
  }

  const events = eventsRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return events;
};

const postUserEvents = async ({ user, title, date, startTime, endTime }) => {
  try {
    const docRef = await db
      .collection("users")
      .doc(user)
      .collection("events")
      .add({
        title,
        date,
        startTime,
        endTime,
      });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getUserEvents, postUserEvents };
