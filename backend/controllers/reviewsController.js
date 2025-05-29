const { getUserReviews } = require("../models/reviewsModel");

const fetchUserReviews = async (req, res) => {
  const uid = req.params.uid;

  try {
    const reviews = await getUserReviews(uid);
    res.json(reviews);
  } catch (err) {
    res.status(404).json({ message: "No reviews" });
  }
};

module.exports = { fetchUserReviews };
