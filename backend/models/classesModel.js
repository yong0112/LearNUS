const { db } = require("../config/firebase");

const getUserClasses = async (uid) => {
  const classesRef = await db
    .collection("users")
    .doc(uid)
    .collection("classes")
    .get();

  if (classesRef.empty) {
    return [];
  }

  const classes = classesRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return classes;
};

const postUserClasses = async ({
  user,
  people,
  course,
  dayOfWeek,
  startTime,
  endTime,
  rate,
  status,
  role,
}) => {
  try {
    const docRef = await db
      .collection("users")
      .doc(user)
      .collection("classes")
      .add({
        people,
        course,
        dayOfWeek,
        startTime,
        endTime,
        rate,
        status,
        role,
      });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getUserClasses, postUserClasses };
