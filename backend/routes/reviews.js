const express = require("express");
const router = express.Router();
const { fetchUserReviews } = require("../controllers/reviewsController");

router.get("/:uid/reviews", fetchUserReviews);

module.exports = router;