const express = require("express");
const router = express.Router();
const {
  fetchUserProfile,
  updateUserProfilePic,
  updateUserQR,
  updateRating,
  updateFavourites,
  setOnboarding,
} = require("../controllers/userController");

router.get("/users/:uid", fetchUserProfile);
router.post("/update-profile-pic", updateUserProfilePic);
router.post("/update-qr", updateUserQR);
router.post("/update-rating", updateRating);
router.post("/update-favourite", updateFavourites);
router.post("/onboard", setOnboarding);

module.exports = router;
