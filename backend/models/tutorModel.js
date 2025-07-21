const { db } = require("../config/firebase");

const getTutors = async () => {
  const tutorRef = await db.collection("tutors").get();

  if (tutorRef.empty) {
    return [];
  }

  const tutors = tutorRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return tutors;
};

const postTutor = async ({
  tutor,
  course,
  location,
  description,
  dayOfWeek,
  startTime,
  endTime,
  rate,
}) => {
  try {
    const docRef = await db.collection("tutors").add({
      tutor,
      course,
      location,
      description,
      dayOfWeek,
      startTime,
      endTime,
      rate,
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error(error);
  }
};

const updateStatus = async (uid, updateData) => {
  const tutorRef = db.collection("tutors").doc(uid);
  await tutorRef.update(updateData);
  return true;
};

module.exports = { getTutors, postTutor, updateStatus };
