const express = require("express");
const router = express.Router();
const { fetchUserClasses, addUserClasses } = require("../controllers/classesController");

router.get("/:uid/classes", fetchUserClasses);
router.post("/:uid/classes", addUserClasses);

module.exports = router;
