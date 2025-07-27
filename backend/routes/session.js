const express = require("express");
const router = express.Router();
const {
  fetchUserSession,
  updateSessionStatus,
  updatePaymentProof,
  cleanupExpiredSessions,
  fetchUserSessionWithExpiration,
} = require("../controllers/sessionController");

router.get("/:uid/classes/:cid", fetchUserSession);
router.post("/:uid/classes/:cid/update-status", updateSessionStatus);
router.post("/:uid/classes/:cid/update-payment", updatePaymentProof);
router.post("/cleanup", cleanupExpiredSessions);
router.get("/safe/:uid/:cid", fetchUserSessionWithExpiration);

module.exports = router;
