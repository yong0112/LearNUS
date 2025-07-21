const express = require("express");
const router = express.Router();
const {
  fetchTutors,
  addTutor,
  updateBooking,
} = require("../controllers/tutorController");

router.get("/", fetchTutors);
router.post("/", addTutor);
router.post("/update-booking", updateBooking);

module.exports = router;
