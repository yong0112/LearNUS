const express = require("express")
const router = express.Router()
const { addUserEvents } = require("../controllers/eventsController");

router.post("/:uid/events", addUserEvents);

module.exports = router;