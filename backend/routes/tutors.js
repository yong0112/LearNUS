const express = require("express");
const router = express.Router();
const {
  fetchTutors,
  addTutor,
  updateBooking,
  filterSuggestedTutor,
} = require("../controllers/tutorController");

router.get("/", fetchTutors);
router.post("/", addTutor);
router.post("/update-booking", updateBooking);
router.post("/suggested", filterSuggestedTutor);

module.exports = router;
