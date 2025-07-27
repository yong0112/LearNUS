const express = require("express");
const router = express.Router();
const {
  fetchUserProfile,
  updateUserProfilePic,
  updateUserQR,
  updateRating,
  updateFavourites,
  setOnboarding,
  resetPassword,
  updatePushToken,
} = require("../controllers/userController");

router.get("/users/:uid", fetchUserProfile);
router.post("/update-profile-pic", updateUserProfilePic);
router.post("/update-qr", updateUserQR);
router.post("/update-rating", updateRating);
router.post("/update-favourite", updateFavourites);
router.post("/onboard", setOnboarding);
router.post("/change-password", resetPassword);
router.post("/users/:uid/push-token", updatePushToken)

module.exports = router;
