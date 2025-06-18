const { db } = require("../config/firebase");

const postUserEvents = async ({
  title,
  date,
  startTime,
  endTime,
}) => {
  try {
    const docRef = await db
      .collection("users")
      .doc(user)
      .collection("events")
      .add({
        title,
        date,
        startTime,
        endTime
      });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { postUserEvents };
