const express = require("express");
const router = express.Router();
const { fetchTutors, addTutor } = require("../controllers/tutorController");

router.get("/", fetchTutors);
router.post("/", addTutor);

module.exports = router;
