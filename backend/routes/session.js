const express = require("express");
const router = express.Router();
const {
  fetchUserSession,
  updateSessionStatus,
  updatePaymentProof,
} = require("../controllers/sessionController");

router.get("/:uid/classes/:cid", fetchUserSession);
router.post("/:uid/classes/:cid/update-status", updateSessionStatus);
router.post("/:uid/classes/:cid/update-payment", updatePaymentProof);

module.exports = router;
