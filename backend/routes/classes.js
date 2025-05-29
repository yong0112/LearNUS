const express = require("express");
const router = express.Router();
const { fetchUserClasses } = require("../controllers/classesController");

router.get("/:uid/classes", fetchUserClasses);

module.exports = router;
