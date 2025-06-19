const express = require("express");
const router = express.Router();
const {
  fetchUserProfile,
  updateUser,
} = require("../controllers/userController");

router.get("/users/:uid", fetchUserProfile);
router.post("/update-profile", updateUser);

module.exports = router;
