const express = require("express");
const router = express.Router();
const { fetchUserProfile } = require("../controllers/userController");

router.get("/:uid", fetchUserProfile);

module.exports = router;
