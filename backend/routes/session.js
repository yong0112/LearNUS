const express = require("express");
const router = express.Router();
const {
  fetchUserSession,
  updateSessionStatus,
} = require("../controllers/sessionController");

router.get("/:uid/classes/:cid", fetchUserSession);
router.post("/:uid/classes/:cid", updateSessionStatus);

module.exports = router;
