const { getUserReviews, postReview } = require("../models/reviewsModel");

const fetchUserReviews = async (req, res) => {
  const uid = req.params.uid;

  try {
    const reviews = await getUserReviews(uid);
    res.json(reviews);
  } catch (err) {
    res.status(404).json({ message: "No reviews" });
  }
};

const addUserReview = async (req, res) => {
  const uid = req.params.uid;
  const { tutor, student, rating, comment, createdAt } = req.body;

  if (!tutor || !student || !rating || !comment || !createdAt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newReview = await postReview({
      tutor,
      student,
      rating,
      comment,
      createdAt,
    });
    res.status(201).json({ message: "Review added", newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", err });
  }
};

module.exports = { fetchUserReviews, addUserReview };
