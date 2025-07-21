const { db } = require("../config/firebase");

const getUserReviews = async (uid) => {
  const reviewsRef = await db
    .collection("users")
    .doc(uid)
    .collection("reviews")
    .get();

  if (reviewsRef.empty) {
    return [];
  }

  const reviews = reviewsRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return reviews;
};

const postReview = async ({ tutor, student, rating, comment, createdAt }) => {
  try {
    const docRef = await db
      .collection("users")
      .doc(tutor)
      .collection("reviews")
      .add({
        student,
        rating,
        comment,
        createdAt,
      });
    const savedData = await docRef.get();
    return { id: docRef.id, ...savedData.data() };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getUserReviews, postReview };
