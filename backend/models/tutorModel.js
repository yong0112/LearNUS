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
  availability,
  rate,
}) => {
  try {
    const docRef = await db.collection("tutors").add({
      tutor,
      course,
      location,
      description,
      availability,
      rate,
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getTutors, postTutor };
