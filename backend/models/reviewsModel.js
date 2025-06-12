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

module.exports = { getUserReviews };
