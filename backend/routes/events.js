const express = require("express")
const router = express.Router()
const { postUserEvents } = require("../controllers/eventsController");

router.post("/:uid/events", postUserEvents);

module.exports = router;