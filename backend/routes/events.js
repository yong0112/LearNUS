const express = require("express");
const router = express.Router();
const {
  fetchUserEvents,
  addUserEvents,
} = require("../controllers/eventsController");

router.get("/:uid/events", fetchUserEvents);
router.post("/:uid/events", addUserEvents);

module.exports = router;
