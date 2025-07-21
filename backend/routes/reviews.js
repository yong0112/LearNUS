const express = require("express");
const router = express.Router();
const {
  fetchUserReviews,
  addUserReview,
} = require("../controllers/reviewsController");

router.get("/:uid/reviews", fetchUserReviews);
router.post("/:uid/reviews", addUserReview);

module.exports = router;
